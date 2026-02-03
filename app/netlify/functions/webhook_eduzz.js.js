const { createClient } = require('@supabase/supabase-js');

// Puxa as chaves das variáveis de ambiente da Netlify (Segurança Total)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.handler = async (event) => {
    // Responde 200 para testes da Eduzz
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, body: "OK" };
    }

    try {
        const body = JSON.parse(event.body);
        
        // Dados específicos da Eduzz
        const token = body.fatura_id; 
        const email = body.cus_email;
        const status = body.fatura_status; // 3 é Pago na Eduzz

        // Se for o teste da Eduzz ou faltar dados, apenas confirma o recebimento
        if (!email || !token) {
            return { statusCode: 200, body: "Teste recebido com sucesso!" };
        }

        // SÓ SALVA SE O STATUS FOR PAGO (Status 3)
        if (status == 3) {
            const { error } = await supabase
                .from('usuarios_assinantes')
                .insert([{ 
                    email: email, 
                    token: token.toString(), 
                    status: 'pago' 
                }]);

            if (error) throw error;
            console.log(`Sucesso: Acesso liberado para ${email}`);
        }

        return { statusCode: 200, body: "Webhook processado" };

    } catch (err) {
        console.error("Erro no Webhook:", err);
        // Retornamos 200 para a Eduzz não desativar o seu endpoint por erro
        return { statusCode: 200, body: `Erro interno: ${err.message}` };
    }
};