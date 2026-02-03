const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") return { statusCode: 200, body: "OK" };

    try {
        const body = JSON.parse(event.body);
        
        // MAPEAMENTO EXATO EDUZZ
        // A Eduzz envia 'transaction' ou 'fatura_id'. Vamos capturar o ID da transação.
        const token = body.transaction || body.fatura_id; 
        const email = body.cus_email || body.email;
        const status = body.status || body.fatura_status; 

        if (!token) return { statusCode: 200, body: "Evento sem transação ignorado." };

        // Na Eduzz, o status 3 significa "Pago"
        if (status == 3 || status == "pago" || status == "paid") {
            const { error } = await supabase
                .from('usuarios_assinantes')
                .insert([{ 
                    email: email, 
                    token: token.toString(), 
                    status: 'pago' 
                }]);

            if (error) console.error("Erro Supabase:", error);
        }

        return { statusCode: 200, body: "OK" };
    } catch (err) {
        return { statusCode: 200, body: "Erro processado" };
    }
};