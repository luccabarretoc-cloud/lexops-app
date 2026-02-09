// ═══════════════════════════════════════════════════════════════════════
// ENVIAR EMAIL COM TOKEN - VIA RESEND
// 
// Esta function envia um email bonito para o cliente após validação
// do token, contendo suas instruções de acesso.
//
// Chamada por: validate-token.js após sucesso
// Requer: RESEND_API_KEY configurada no Netlify
// ═══════════════════════════════════════════════════════════════════════

const { Resend } = require('resend');

exports.handler = async (event) => {
    console.log("═══════════════════════════════════════════");
    console.log("📧 ENVIO DE EMAIL - NOVO EVENTO");
    console.log("═══════════════════════════════════════════");

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers: corsHeaders, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Apenas POST é aceito" })
        };
    }

    try {
        // Parse do body
        const body = JSON.parse(event.body);
        const { email, token, nome } = body;

        console.log("📋 Parâmetros recebidos:");
        console.log("  Email:", email);
        console.log("  Token:", token?.substring(0, 8) + "...");
        console.log("  Nome:", nome);

        // ─── Validações ───
        if (!email) {
            console.error("❌ Email não fornecido");
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "Email é obrigatório" })
            };
        }

        if (!token) {
            console.error("❌ Token não fornecido");
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "Token é obrigatório" })
            };
        }

        // ─── Verificar API Key ───
        if (!process.env.RESEND_API_KEY) {
            console.error("❌ RESEND_API_KEY não configurada");
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: "Email service não configurado",
                    hint: "Configure RESEND_API_KEY no Netlify"
                })
            };
        }

        // ─── Inicializar Resend ───
        const resend = new Resend(process.env.RESEND_API_KEY);

        console.log("📧 Preparando email...");

        // ─── Preparar conteúdo do email ───
        const siteUrl = process.env.URL || process.env.SITE_URL || "https://app.lexopsinsight.com.br";
        const accessUrl = `${siteUrl}/?token=${encodeURIComponent(token)}`;
        const nomeCliente = nome ? nome.split(' ')[0] : "Cliente";
        const logoUrl = `${siteUrl}/assets/img/logo-lexops.png`;

        const emailHtml = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu código de acesso - LexOps Insight</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 20px;
        }
        .wrapper {
            max-width: 600px;
            margin: 0 auto;
        }
        .container { 
            background: white; 
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
        }
        .header { 
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            height: 50px;
            margin-bottom: 24px;
            display: inline-block;
        }
        .header h1 { 
            font-size: 28px; 
            font-weight: 800; 
            margin-bottom: 8px; 
            color: white;
        }
        .header p { 
            font-size: 14px; 
            opacity: 0.95;
            color: rgba(255,255,255,0.9);
        }
        .content { 
            padding: 48px 40px;
        }
        .greeting { 
            font-size: 18px; 
            color: #1e293b; 
            margin-bottom: 16px;
            font-weight: 600;
        }
        .intro-text {
            font-size: 15px;
            color: #475569;
            line-height: 1.7;
            margin-bottom: 32px;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 32px 0;
        }
        .token-section {
            text-align: center;
            margin: 40px 0;
        }
        .token-label { 
            font-size: 12px; 
            font-weight: 700; 
            color: #7c3aed; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            margin-bottom: 12px;
            display: block;
        }
        .token-box { 
            background: linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%);
            border: 2px solid #e9d5ff;
            border-radius: 12px; 
            padding: 28px; 
            margin: 0 auto;
        }
        .token-code { 
            font-size: 22px; 
            font-weight: 900; 
            font-family: 'Monaco', 'Courier New', monospace; 
            color: #4f46e5;
            letter-spacing: 2px;
            word-break: break-all;
            background: white;
            padding: 16px;
            border-radius: 8px;
            margin: 12px 0;
        }
        .token-hint { 
            font-size: 12px; 
            color: #7c3aed; 
            margin-top: 12px; 
            font-weight: 600;
        }
        .instructions { 
            background: #f0f4ff; 
            border-left: 5px solid #4f46e5; 
            padding: 24px;
            border-radius: 8px; 
            margin: 32px 0;
        }
        .instructions h3 { 
            font-size: 16px; 
            font-weight: 800; 
            color: #4f46e5; 
            margin-bottom: 16px;
        }
        .instructions ol { 
            margin-left: 20px; 
            font-size: 15px; 
            color: #475569; 
            line-height: 2;
        }
        .instructions li {
            margin-bottom: 8px;
        }
        .cta-button-wrapper {
            text-align: center;
            margin: 40px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            padding: 16px 48px;
            border-radius: 10px;
            font-weight: 800;
            font-size: 16px;
            box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
            transition: all 0.3s ease;
        }
        .cta-button:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 12px 28px rgba(79, 70, 229, 0.4);
        }
        .support-box {
            background: #fef3c7;
            border-left: 5px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 32px 0;
        }
        .support-box h4 {
            font-size: 14px;
            font-weight: 700;
            color: #92400e;
            margin-bottom: 8px;
        }
        .support-box p {
            font-size: 13px;
            color: #b45309;
            line-height: 1.6;
        }
        .footer { 
            background: #f8fafc; 
            padding: 32px; 
            text-align: center; 
            border-top: 1px solid #e2e8f0;
        }
        .footer-logo {
            height: 30px;
            margin-bottom: 16px;
        }
        .footer p { 
            font-size: 12px; 
            color: #94a3b8; 
            line-height: 1.8;
        }
        .footer a { 
            color: #4f46e5; 
            text-decoration: none;
            font-weight: 600;
        }
        .footer-divider {
            height: 1px;
            background: #e2e8f0;
            margin: 12px 0;
        }
        @media (max-width: 600px) {
            .content, .header {
                padding: 24px 20px;
            }
            .token-code {
                font-size: 16px;
            }
            .cta-button {
                padding: 14px 32px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header com Logo -->
            <div class="header">
                <img src="${logoUrl}" alt="LexOps Insight" class="logo">
                <h1>🎉 Acesso Liberado!</h1>
                <p>Bem-vindo ao LexOps Insight</p>
            </div>

            <!-- Conteúdo Principal -->
            <div class="content">
                <p class="greeting">Olá <strong>${nomeCliente}</strong>!</p>
                
                <p class="intro-text">
                    Obrigado por confiar na <strong>LexOps Insight</strong>! 
                    Sua compra foi confirmada e seu acesso está 100% pronto.
                </p>

                <div class="divider"></div>

                <!-- Seção do Token -->
                <div class="token-section">
                    <span class="token-label">🔑 Seu código de acesso</span>
                    <div class="token-box">
                        <div class="token-code">${token}</div>
                        <div class="token-hint">💡 Copie e guarde este código! Você usará sempre que precisar.</div>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- Instruções -->
                <div class="instructions">
                    <h3>📋 Como Acessar (3 Passos)</h3>
                    <ol>
                        <li><strong>Visite</strong> <a href="${siteUrl}" style="color: #4f46e5; font-weight: 700;">${siteUrl}</a></li>
                        <li><strong>Cole seu código</strong> no campo de acesso</li>
                        <li><strong>Clique em "Entrar"</strong> e aproveite! 🚀</li>
                    </ol>
                </div>

                <!-- Botão CTA -->
                <div class="cta-button-wrapper">
                    <a href="${accessUrl}" class="cta-button">
                        ✨ Acessar Dashboard Agora
                    </a>
                </div>

                <!-- Box de Suporte -->
                <div class="support-box">
                    <h4>❓ Dúvidas ou Problemas?</h4>
                    <p>Se encontrar qualquer dificuldade, nossa equipe de suporte está aqui para ajudar. Entre em contato conosco!</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <img src="${logoUrl}" alt="LexOps Insight" class="footer-logo">
                <p>
                    <a href="${siteUrl}">Acessar Dashboard</a>
                </p>
                <div class="footer-divider"></div>
                <p>
                    LexOps Insight © 2024<br>
                    <small>Este é um email automático. Não responda este endereço.</small>
                </p>
            </div>
        </div>
    </div>
</body>
</html>`;

        // ─── Enviar email via Resend ───
        console.log("📤 Enviando email via Resend...");

        const response = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "noreply@lexopsinsight.com.br",
            to: email,
            subject: "🔑 Seu código de acesso - LexOps Insight",
            html: emailHtml
        });

        console.log("✅ Email enviado com sucesso!");
        console.log("  Email ID:", response.id);

        return {
            statusCode: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                message: "Email enviado com sucesso",
                emailId: response.id
            })
        };

    } catch (err) {
        console.error("❌ ERRO:", err.message);
        console.error("Stack:", err.stack);

        return {
            statusCode: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: "Erro ao enviar email: " + err.message
            })
        };
    }
};
