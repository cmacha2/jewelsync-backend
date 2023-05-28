const shopifyRequest = require('../utils/shopifyRequest');
const { decrypt } = require('../utils/utils');

exports.getDailyPayments = async (req, res) => {
    try {
      const authorizationHeader = req.headers.authorization;
      const accessToken = decrypt(authorizationHeader.split(' ')[1]);
      const shop = req.headers.shop;
  
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
  
      const startDate = req.query.start_date || `${currentYear}-${currentMonth}-${currentDay}`;
      const endDate = req.query.end_date || `${currentYear}-${currentMonth}-${currentDay}`;
  
      const url = `orders.json?financial_status=paid&processed_at_min=${startDate}&processed_at_max=${endDate}`;
    
  
      // Realiza una solicitud GET a la API de Shopify para obtener los pagos diarios
      const response = await shopifyRequest(shop, accessToken, 'GET', url);
      console.log(response.data);
      const payments = response.data.orders;
  
      res.json(payments);
    } catch (error) {
      console.error('Error al obtener los pagos diarios:', error);
      res.status(500).json({ error: 'Error al obtener los pagos diarios' });
    }
  };
  
  exports.getWeeklyPayments = async (req, res) => {
    try {
      const authorizationHeader = req.headers.authorization;
      const accessToken = decrypt(authorizationHeader.split(' ')[1]);
      const shop = req.headers.shop;
  
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      const currentDayOfWeek = currentDate.getDay();
  
      const startOfWeek = req.query.start_date || `${currentYear}-${currentMonth}-${currentDay - currentDayOfWeek}`;
      const endOfWeek = req.query.end_date || `${currentYear}-${currentMonth}-${currentDay + (6 - currentDayOfWeek)}`;
  
      const url = `orders.json?status=any&financial_status=paid&processed_at_min=${startOfWeek}&processed_at_max=${endOfWeek}`;

      // Realiza una solicitud GET a la API de Shopify para obtener los pagos semanales
      const response = await shopifyRequest(shop, accessToken, 'GET', url);
      console.log(response.data);
      const payments = response.data.orders;
  
      res.json(payments);
    } catch (error) {
      console.error('Error al obtener los pagos semanales:', error);
      res.status(500).json({ error: 'Error al obtener los pagos semanales' });
    }
  };
  
  exports.getMonthlyPayments = async (req, res) => {
    try {
      const authorizationHeader = req.headers.authorization;
      const accessToken = decrypt(authorizationHeader.split(' ')[1]);
      const shop = req.headers.shop;
  
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
  
      const startOfMonth = req.query.start_date || `${currentYear}-${currentMonth}-01`;
      const endOfMonth = req.query.end_date || `${currentYear}-${currentMonth}-${getDaysInMonth(currentMonth, currentYear)}`;
  
      const url = `orders.json?status=any&financial_status=paid&processed_at_min=${startOfMonth}&processed_at_max=${endOfMonth}`;
  
      // Realiza una solicitud GET a la API de Shopify para obtener los pagos mensuales
      const response = await shopifyRequest(shop, accessToken, 'GET', url);
      const payments = response.data.orders;
  
      res.json(payments);
    } catch (error) {
        console.error('Error al obtener los pagos mensuales:', error);
        res.status(500).json({ error: 'Error al obtener los pagos mensuales' });
      }
    };
    

    exports.getLastSixMonthsPayments = async (req, res) => {
        try {
          const authorizationHeader = req.headers.authorization;
          const accessToken = decrypt(authorizationHeader.split(' ')[1]);
          const shop = req.headers.shop;
      
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
      
          const startMonth = currentMonth - 5 > 0 ? currentMonth - 5 : 12 + (currentMonth - 5);
          const startYear = currentMonth - 5 > 0 ? currentYear : currentYear - 1;
      
          const endMonth = currentMonth;
          const endYear = currentYear;
      
          const startDate = `${startYear}-${startMonth}-01`;
          const endDate = `${endYear}-${endMonth}-${getDaysInMonth(endMonth, endYear)}`;
      
          const url = `orders.json?status=any&financial_status=paid&processed_at_min=${startDate}&processed_at_max=${endDate}`;
      
          // Realiza una solicitud GET a la API de Shopify para obtener los pagos de los últimos seis meses
          const response = await shopifyRequest(shop, accessToken, 'GET', url);
          const lastSixMonthsPayments = response.data.orders;
      
          res.json(lastSixMonthsPayments);
        } catch (error) {
          console.error('Error al obtener los pagos de los últimos seis meses:', error);
          res.status(500).json({ error: 'Error al obtener los pagos de los últimos seis meses' });
        }
      };
      
      // Función auxiliar para obtener el número de días en un mes determinado
      function getDaysInMonth(month, year) {
        return new Date(year, month, 0).getDate();
      }
      
exports.getAccountBalance = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const accessToken = decrypt(authorizationHeader.split(' ')[1]) 
    const shop = req.headers.shop;

        // Realiza una solicitud GET a la API de Shopify para obtener el balance de la cuenta
        const response = await shopifyRequest(shop, accessToken, 'GET', '/shopify_payments/balance.json');
        const accountBalance = response.data.balance;
    
        res.json({ balance: accountBalance });
      } catch (error) {
        console.error('Error al obtener el balance de la cuenta:', error);
        res.status(500).json({ error: 'Error al obtener el balance de la cuenta' });
      }
    };
    
    exports.getRecentTransactions = async (req, res) => {
      try {
        const authorizationHeader = req.headers.authorization;
        const accessToken = decrypt(authorizationHeader.split(' ')[1]);
        const shop = req.headers.shop;
    
        // Realiza una solicitud GET a la API de Shopify para obtener las transacciones recientes
        const response = await shopifyRequest(shop, accessToken, 'GET', 'account/transactions');
        const recentTransactions = response.data.transactions;
    
        res.json(recentTransactions);
      } catch (error) {
        console.error('Error al obtener las transacciones recientes:', error);
        res.status(500).json({ error: 'Error al obtener las transacciones recientes' });
      }
    };
    