// ═══════════════════════════════════════════════════════════════════════
// PROCESSADOR DE REDIRECIONAMENTO EDUZZ → LEXOPS
// 
// Processa URLs padrão da Eduzz (thank you page) e as converte
// em URLs com token válido no Supabase, com registro automático.
//
// Fluxo:
//   1. Cliente é redirecionado da Eduzz com transactionkey=...
//   2. Essa função recebe os parâmetros
//   3. Cria/atualiza registro no Supabase
//   4. Redireciona para /?token=transactionkey com acesso garantido
// ═══════════════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
    console.log("═══════════════════════════════════════════");
    console.log("📥 PROCESSADOR EDUZZ URL - NOVO EVENTO");
    console.log("═══════════════════════════════════════════");
    console.log("Método:", event.httpMethod);
    console.log("Query params:", JSON.stringify(event.queryStringParameters, null, 2));

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: corsHeaders, body: "" };
    }

    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Apenas GET é aceito" })
        };
    }

    try {
        const params = event.queryStringParameters || {};

        console.log("📋 Parâmetros recebidos da Eduzz:");
        console.log("  transactionkey:", params.transactionkey);
        console.log("  chave:", params.chave);
        console.log("  email_comprador:", params.email_comprador);
        console.log("  nome_comprador:", params.nome_comprador);
        console.log("  valor:", params.valor);
        console.log("  moeda:", params.moeda);

        // ─── Extração inteligente do token ───
        const token = String(
            params.transactionkey ||
            params.chave ||
            params.invoice_id ||
            params.edz_fat_cod ||
            ''
        ).trim();

        if (!token) {
            console.error("❌ Token (transactionkey/chave) não encontrado!");
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "Token não encontrado nos parâmetros" })
            };
        }

        console.log("✅ Token extraído:", token.substring(0, 8) + '...');

        // ─── Extração de dados adicionais ───
        const email = String(params.email_comprador || params.email || '').trim();
        const nome = String(params.nome_comprador || params.name || '').trim();
        const valor = String(params.valor || '').trim();
        const moeda = String(params.moeda || 'BRL').trim();
        const produtoId = String(params.produto || params.product_id || '').trim();
        const edzChave = String(params.chave || '').trim();

        console.log("─── Dados Extraídos ───");
        console.log("Email:", email);
        console.log("Nome:", nome);
        console.log("Valor:", valor, moeda);
        console.log("Produto:", produtoId);

        // ─── Registrar no Supabase ───
        if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            try {
                const supabase = createClient(
                    process.env.SUPABASE_URL,
                    process.env.SUPABASE_SERVICE_ROLE_KEY
                );

                // Verifica se já existe
                const { data: existing } = await supabase
                    .from('usuarios_assinantes')
                    .select('id')
                    .eq('token', token)
                    .maybeSingle();

                if (existing) {
                    console.log("ℹ️ Token já existe. Atualizando dados...");
                    const { error } = await supabase
                        .from('usuarios_assinantes')
                        .update({
                            status: 'pago',
                            email: email || undefined,
                            nome: nome || undefined,
                            updated_at: new Date().toISOString()
                        })
                        .eq('token', token);

                    if (error) {
                        console.error("⚠️ Erro ao atualizar:", error.message);
                    } else {
                        console.log("✅ Registro atualizado");
                    }
                } else {
                    console.log("📝 Criando novo registro...");
                    const { error } = await supabase
                        .from('usuarios_assinantes')
                        .insert([{
                            token: token,
                            status: 'pago',
                            email: email || null,
                            nome: nome || null,
                            valor: valor || null,
                            moeda: moeda,
                            produto_id: produtoId || null,
                            chave_eduzz: edzChave || null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }]);

                    if (error) {
                        console.error("⚠️ Erro Supabase (insert):", error.message);
                        // Tenta versão simplificada
                        const { error: error2 } = await supabase
                            .from('usuarios_assinantes')
                            .insert([{
                                token: token,
                                status: 'pago',
                                email: email || null,
                                nome: nome || null
                            }]);

                        if (error2) {
                            console.error("❌ Erro na tentativa simplificada:", error2.message);
                        } else {
                            console.log("✅ Gravado (versão simplificada)");
                        }
                    } else {
                        console.log("✅ Novo registro criado com sucesso!");
                    }
                }
            } catch (dbErr) {
                console.error("❌ Erro de conexão Supabase:", dbErr.message);
                // Continua mesmo com erro - o redirect é o importante
            }
        } else {
            console.log("⚠️ Variáveis Supabase não configuradas");
        }

        // ═══════════════════════════════════════════════════════════════
        // 🎯 REDIRECT: Redireciona para o dashboard com o token
        // ═══════════════════════════════════════════════════════════════

        const siteUrl = process.env.URL || process.env.SITE_URL || `https://${event.headers.host}`;
        const redirectUrl = `${siteUrl}/?token=${encodeURIComponent(token)}`;

        console.log("🚀 Redirecionando para:", redirectUrl);

        // Retorna página HTML com redirect automático
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

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                status: "error",
                message: "Erro ao processar: " + err.message
            })
        };
    }
};
