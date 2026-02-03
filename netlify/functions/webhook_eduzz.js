const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.handler = async (event) => {
    console.log("--- NOVO EVENTO RECEBIDO DA EDUZZ ---");
    if (event.httpMethod === "OPTIONS") return { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        
        // MAPEAMENTO REVISADO PARA O NOVO PADRÃO EDUZZ
        const info = body.data || body; // Se tiver 'data', usa ele, senão usa a raiz
        
        const token = info.id || info.transaction?.id || info.transaction || info.fatura_id;
        const email = info.buyer?.email || info.cus_email || info.email || info.student?.email;
        const status = info.status || info.fatura_status;

        console.log(`Campos extraídos -> Token: ${token}, Email: ${email}, Status: ${status}`);

        // Aceita 'paid', 'pago' ou o código 3
        if (status === "paid" || status === "pago" || status === 3) {
            console.log("Status validado como PAGO. Tentando gravar no Supabase...");
            
            const { error } = await supabase
                .from('usuarios_assinantes')
                .insert([{ 
                    email: email, 
                    token: token.toString(), 
                    status: 'pago' 
                }]);

            if (error) {
                console.error("ERRO NO SUPABASE:", error.message);
                return { statusCode: 500, body: error.message };
            }
            console.log("SUCESSO: Gravado no Supabase!");
        } else {
            console.log(`Evento ignorado. Status recebido: ${status}`);
        }

        return { statusCode: 200, body: "Processado" };
    } catch (err) {
        console.error("ERRO DE PROCESSAMENTO:", err.message);
        return { statusCode: 500, body: err.message };
    }
};