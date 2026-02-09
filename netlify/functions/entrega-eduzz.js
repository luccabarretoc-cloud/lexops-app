// ═══════════════════════════════════════════════════════════════════════
// ENTREGA CUSTOMIZADA EDUZZ → LEXOPS INSIGHT
// 
// Esta function recebe o POST da Eduzz (Entrega Customizada)
// e redireciona o comprador para o dashboard com o token na URL.
//
// URL para configurar no Órbita: 
//   https://SEU-SITE.netlify.app/.netlify/functions/entrega-eduzz
// ═══════════════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    console.log("═══════════════════════════════════════════");
    console.log("📦 ENTREGA CUSTOMIZADA EDUZZ - NOVO EVENTO");
    console.log("═══════════════════════════════════════════");
    console.log("Método:", event.httpMethod);
    console.log("Headers:", JSON.stringify(event.headers, null, 2));

    // ─── CORS / Preflight ───
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: corsHeaders, body: "" };
    }

    // ─── A Eduzz pode enviar GET (teste de validação) ou POST (entrega real) ───
    
    // GET = Teste de validação da URL (Eduzz verifica se a URL responde 200)
    if (event.httpMethod === "GET") {
        console.log("✅ Requisição GET de teste/validação da Eduzz");
        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: "ok", message: "Entrega customizada LexOps Insight ativa" })
        };
    }

    // ─── POST = Entrega real após compra ───
    try {
        // Parse do body (Eduzz envia como JSON ou form-urlencoded)
        let fields = {};
        let type = 'create';
        
        const contentType = (event.headers['content-type'] || '').toLowerCase();
        
        if (contentType.includes('application/json')) {
            const parsed = JSON.parse(event.body);
            // A Eduzz envia: { type: "create"|"remove", fields: {...}, sid: "...", nsid: "..." }
            type = parsed.type || 'create';
            fields = parsed.fields || parsed.data || parsed;
            console.log("📋 Payload JSON recebido. Type:", type);
        } else if (contentType.includes('form-urlencoded')) {
            const params = new URLSearchParams(event.body);
            for (const [key, value] of params.entries()) {
                fields[key] = value;
            }
            type = fields.type || 'create';
            console.log("📋 Payload form-urlencoded recebido. Type:", type);
        } else {
            // Tenta JSON como fallback
            try {
                const parsed = JSON.parse(event.body);
                type = parsed.type || 'create';
                fields = parsed.fields || parsed.data || parsed;
            } catch (e) {
                const params = new URLSearchParams(event.body);
                for (const [key, value] of params.entries()) {
                    fields[key] = value;
                }
                type = fields.type || 'create';
            }
        }

        console.log("📋 Campos recebidos:", JSON.stringify(fields, null, 2));

        // ─── Extração inteligente dos dados ───
        // A Eduzz envia diversos campos, tentamos extrair os mais importantes
        const token = String(
            fields.edz_fat_cod ||          // Código da fatura (mais comum)
            fields.trans_cod ||             // Código da transação
            fields.edz_fat_id ||           // ID da fatura
            fields.invoice_id ||            // ID alternativo
            fields.id ||                    // Fallback genérico
            ''
        ).trim();

        const email = String(
            fields.edz_cli_email ||         // Email do cliente (padrão Eduzz)
            fields.cus_email ||             // Email alternativo
            fields.email ||                 // Fallback
            fields.edz_cli_email2 ||        // Email secundário
            ''
        ).trim();

        const nome = String(
            fields.edz_cli_name ||          // Nome do cliente
            fields.cus_name ||              // Nome alternativo
            fields.name ||                  // Fallback
            ''
        ).trim();

        const status = String(
            fields.edz_fat_status ||        // Status da fatura Eduzz
            fields.trans_status ||          // Status alternativo
            fields.status ||                // Fallback
            ''
        ).trim();

        const produtoId = String(
            fields.edz_cnt_cod ||           // Código do conteúdo
            fields.product_id ||            // ID do produto
            ''
        ).trim();

        console.log("─── Dados Extraídos ───");
        console.log("Token (fatura):", token);
        console.log("Email:", email);
        console.log("Nome:", nome);
        console.log("Status:", status);
        console.log("Produto:", produtoId);
        console.log("Type:", type);

        // ─── Validação: Se é remoção de acesso (reembolso), não entrega ───
        if (type === 'remove') {
            console.log("⚠️ Evento de REMOÇÃO (reembolso/cancelamento). Não entrega.");
            
            // Opcional: Marcar no Supabase como cancelado
            if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && token) {
                try {
                    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    await supabase
                        .from('usuarios_assinantes')
                        .update({ status: 'cancelado' })
                        .eq('token', token);
                    console.log("📝 Status atualizado para 'cancelado' no Supabase");
                } catch (dbErr) {
                    console.error("Erro ao atualizar status:", dbErr.message);
                }
            }

            return {
                statusCode: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "ok", message: "Remoção processada" })
            };
        }

        // ─── Validação: Token obrigatório ───
        if (!token) {
            console.error("❌ Token (código da fatura) não encontrado no payload!");
            console.error("Body completo:", event.body);
            return {
                statusCode: 200, // Retorna 200 para a Eduzz não ficar reenviando
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "error", message: "Token não encontrado no payload" })
            };
        }

        // ─── Validação opcional do origin_secret (segurança) ───
        if (process.env.EDUZZ_ORIGIN_SECRET) {
            const receivedSecret = fields.edz_cli_origin_secret || '';
            if (receivedSecret && receivedSecret !== process.env.EDUZZ_ORIGIN_SECRET) {
                console.error("❌ origin_secret inválido! Possível requisição fraudulenta.");
                return {
                    statusCode: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: "error", message: "Autenticação inválida" })
                };
            }
        }

        // ─── Gravar no Supabase ───
        if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            try {
                const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

                // Verifica se já existe (evita duplicata)
                const { data: existing } = await supabase
                    .from('usuarios_assinantes')
                    .select('id')
                    .eq('token', token)
                    .maybeSingle();

                if (existing) {
                    console.log("ℹ️ Token já existe no Supabase. Atualizando status...");
                    await supabase
                        .from('usuarios_assinantes')
                        .update({ status: 'pago', email: email || undefined })
                        .eq('token', token);
                } else {
                    console.log("📝 Gravando novo registro no Supabase...");
                    const { error } = await supabase
                        .from('usuarios_assinantes')
                        .insert([{
                            email: email || null,
                            token: token,
                            status: 'pago',
                            nome: nome || null,
                            produto_id: produtoId || null,
                            created_at: new Date().toISOString()
                        }]);

                    if (error) {
                        console.error("⚠️ Erro Supabase (insert):", error.message);
                        // Tenta insert sem campos extras (caso a tabela não tenha essas colunas)
                        const { error: error2 } = await supabase
                            .from('usuarios_assinantes')
                            .insert([{
                                email: email || null,
                                token: token,
                                status: 'pago'
                            }]);
                        if (error2) {
                            console.error("❌ Erro Supabase (fallback insert):", error2.message);
                        } else {
                            console.log("✅ Gravado no Supabase (formato simplificado)");
                        }
                    } else {
                        console.log("✅ Gravado no Supabase com sucesso!");
                    }
                }
            } catch (dbErr) {
                console.error("❌ Erro de conexão com Supabase:", dbErr.message);
                // Não bloqueia o redirect - o importante é o cliente acessar
            }
        } else {
            console.log("⚠️ Variáveis SUPABASE não configuradas. Pulando gravação.");
        }

        // ═══════════════════════════════════════════════════════════════
        // 🎯 REDIRECT: Redireciona o comprador para o dashboard com token
        // ═══════════════════════════════════════════════════════════════
        
        // Monta a URL base do site (usa variável de ambiente ou detecta do header)
        const siteUrl = process.env.URL || process.env.SITE_URL || `https://${event.headers.host}`;
        const redirectUrl = `${siteUrl}/?token=${encodeURIComponent(token)}`;

        console.log("🚀 Redirecionando comprador para:", redirectUrl);

        // ─── Retorna página HTML com redirect automático ───
        // Usamos HTML ao invés de 302 porque a Eduzz pode não seguir redirects
        // O HTML garante que o NAVEGADOR do comprador vai para a URL correta
        const htmlRedirect = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=${redirectUrl}">
    <title>Acessando seu painel...</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0f172a;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            text-align: center;
        }
        .container {
            background: rgba(255,255,255,0.05);
            padding: 60px 40px;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.1);
            max-width: 480px;
        }
        .spinner {
            width: 48px; height: 48px;
            border: 4px solid rgba(255,255,255,0.2);
            border-top-color: #818cf8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 24px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        h1 { font-size: 22px; font-weight: 800; margin-bottom: 12px; }
        p { font-size: 14px; opacity: 0.7; margin-bottom: 24px; }
        a {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            padding: 12px 32px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            transition: transform 0.2s;
        }
        a:hover { transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h1>🎉 Compra confirmada!</h1>
        <p>Estamos liberando seu acesso ao painel. Você será redirecionado automaticamente...</p>
        <a href="${redirectUrl}">Clique aqui se não for redirecionado</a>
    </div>
    <script>
        // Redirect via JS como backup do meta refresh
        setTimeout(function() {
            window.location.href = "${redirectUrl}";
        }, 1500);
    </script>
</body>
</html>`;

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/html; charset=utf-8'
            },
            body: htmlRedirect
        };

    } catch (err) {
        console.error("💥 ERRO FATAL:", err.message);
        console.error("Stack:", err.stack);
        console.error("Body recebido:", event.body);

        return {
            statusCode: 200, // Retorna 200 para a Eduzz não reenviar
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: "error", 
                message: "Erro interno: " + err.message 
            })
        };
    }
};
