# MagangHub — Platform Magang & PKL Interaktif Indonesia

Platform end-to-end pencarian, persiapan berkas, pendaftaran, seleksi interaktif, hingga penerimaan (*onboarding*) magang untuk Siswa SMK dan Mahasiswa di Indonesia.

---

## Langkah Setup Supabase (WAJIB)

1. **Buat Project Supabase**
   - Buka [supabase.com](https://supabase.com) dan buat project baru.
   - Masuk ke **Project Settings → API**, lalu salin:
     - `Project URL`
     - `anon public` key
     - `service_role secret` key
   - Duplikat file `.env.example` menjadi `.env` di root project, lalu isi dengan kredensial Supabase milikmu:
     ```env
     SUPABASE_URL=https://xxxx.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=eyJ...
     PORT=3001

     VITE_SUPABASE_URL=https://xxxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJ...
     ```

2. **Jalankan SQL Schema & Seed**
   - Buka menu **SQL Editor** di dashboard Supabase.
   - Salin seluruh isi file `supabase/schema.sql`, jalankan (**Run**).
   - Salin seluruh isi file `supabase/seed.sql`, jalankan (**Run**).

3. **Matikan Confirm Email (Agar Demo Langsung Bisa Login)**
   - Buka menu **Authentication → Providers → Email**.
   - **Matikan** toggle **"Confirm email"** lalu klik **Save**.

4. **Install & Jalankan Aplikasi**
   ```bash
   npm install
   npm run seed
   npm run dev
   ```
   - Backend API berjalan di `http://localhost:3001`
   - Frontend Vite berjalan di `http://localhost:5173`

---

## Akun Demo

Setelah menjalankan `npm run seed`, kamu bisa langsung klik tombol **"Coba Akun Demo"** di halaman Masuk atau gunakan:
- **Email:** `demo@maganghub.id`
- **Password:** `demo12345`
