const { createClient } = require('@supabase/supabase-js');

// Pega as chaves das variáveis de ambiente que você cadastrou
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.handler = async (event) => {
    // Log inicial para saber que a Eduzz bateu na porta
    console.log("--- NOVO EVENTO RECEBIDO DA EDUZZ ---");

    if (event.httpMethod === "OPTIONS") return { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        console.log("Corpo da requisição:", JSON.stringify(body));

        const token = body.transaction || body.fatura_id;
        const email = body.cus_email || body.email;
        const status = body.status || body.fatura_status;

        // Se o status for 3 (Pago na Eduzz)
        if (status == 3 || status == "pago" || status == "paid") {
            console.log(`Tentando inserir: Email: ${email}, Token: ${token}`);
            
            const { data, error } = await supabase
                .from('usuarios_assinantes')
                .insert([{ email: email, token: token.toString(), status: 'pago' }]);

            if (error) {
                console.error("ERRO CRÍTICO SUPABASE:", error.message);
                return { statusCode: 500, body: `Erro no banco: ${error.message}` };
            }
            console.log("SUCESSO: Registro criado no Supabase!");
        } else {
            console.log(`Status ignorado: ${status}`);
        }

        return { statusCode: 200, body: "Processado com sucesso" };

    } catch (err) {
        console.error("ERRO DE PROCESSAMENTO:", err.message);
        return { statusCode: 500, body: err.message };
    }
};