const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

exports.handler = async (event, context) => {
  // 1. Verificar se é POST (só aceitamos dados enviados)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. Validar a Assinatura (Segurança do Lemon Squeezy)
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(event.body).digest('hex');
    const signature = event.headers['x-signature'];

    if (!signature || signature !== digest) {
      return { statusCode: 401, body: 'Assinatura inválida' };
    }

    // 3. Ler os dados da venda
    const payload = JSON.parse(event.body);
    const { meta, data } = payload;
    
    // Pegamos o email do cliente e o nome do evento
    const eventName = meta.event_name;
    const userEmail = data.attributes.user_email;

    console.log(`Recebido evento: ${eventName} para ${userEmail}`);

    // 4. Se a venda foi criada ou paga, liberamos o acesso
    if (eventName === 'order_created' || eventName === 'subscription_created' || eventName === 'subscription_updated') {
      
      // Conectar no Supabase
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usar a Service Role (segredo total)
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Gerar um token simples (pode ser melhorado depois)
      const tokenAcesso = crypto.randomBytes(16).toString('hex');

      // Gravar no Banco de Dados
      const { error } = await supabase
        .from('access_tokens')
        .insert([
          { 
            email: userEmail, 
            token: tokenAcesso,
            created_at: new Date(),
            is_active: true
          }
        ]);

      if (error) throw error;

      console.log('Sucesso! Token gerado no Supabase.');
    }

    return { statusCode: 200, body: 'Webhook recebido com sucesso!' };

  } catch (error) {
    console.error('Erro no processamento:', error);
    return { statusCode: 500, body: `Erro: ${error.message}` };
  }
};