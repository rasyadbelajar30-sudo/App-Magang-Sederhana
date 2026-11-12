const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (
  !supabaseUrl ||
  !supabaseServiceKey ||
  supabaseUrl.includes('xxxx.supabase.co') ||
  supabaseServiceKey.endsWith('...')
) {
  console.error(
    '\n[MagangHub Error] Isi .env dengan kredensial Supabase (lihat README)\n' +
      'Pastikan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah terisi dengan benar di file .env.\n'
  );
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabaseAdmin };
