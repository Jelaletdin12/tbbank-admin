# Proje Geliştirme Standartları ve AI/Agent Rehberi (TBBank Admin)

Bu doküman, projenin büyümesiyle yapının bozulmaması ve projede çalışacak olan yapay zeka (AI) asistanlarının / agent'ların mimariyi karıştırmaması için hazırlanmıştır. Geliştirme yaparken aşağıdaki kurallara **kesinlikle** uyulmalıdır.

## 1. Temel Teknoloji Yığını ve Kullanım Yerleri

- **State Management:** `zustand`
  - **Path:** `src/app/store/` (Örn: `authStore.ts`, `themeStore.ts`, `i18nStore.ts`)
  - Sadece global state (kullanıcı oturumu, tema, dil vb.) için kullanılmalıdır. Component içi basit stateler için `useState` kullanın.
- **Data Fetching & Caching:** `@tanstack/react-query`
  - **Path:** `src/features/[feature-name]/hooks/` (Örn: `src/features/auth/hooks/useLogin.ts`)
  - Bütün API istekleri custom hook'lar içerisine sarmalanmalı ve doğrudan component içinde `useQuery` veya `useMutation` yazılmamalıdır.
- **HTTP Client:** `axios`
  - **Path:** `src/lib/api/client.ts`
  - Tüm istekler merkezi axios instance'ı üzerinden yapılmalıdır. Interceptor'lar (token ekleme, hata yakalama vb.) bu dosyada yönetilir.

## 2. Kullanıcı Deneyimi (UX) ve UI Kuralları

- **Smooth UX:**
  - Yükleme durumları (loading states) her zaman gösterilmelidir (`src/components/ui/spinner.tsx` veya `skeleton.tsx`).
  - İşlem beklerken butonlar `disabled` duruma geçmelidir.
  - Geçişler ve animasyonlar pürüzsüz olmalıdır.

- **Bildirimler (Toast):** `sonner`
  - **Path:** `import { toast } from 'sonner'` (Bileşen Provider'ı: `src/components/ui/sonner.tsx`)
  - Her başarılı `mutation` (ekleme/güncelleme/silme) işleminden sonra **kesinlikle** başarı mesajı (`toast.success()`) gösterilmelidir.
  - Hatalı işlemlerde **kesinlikle** hata mesajı (`toast.error()`) gösterilmelidir.

- **Tema (Light / Dark Mode):**
  - Projede açık ve koyu tema desteği zorunludur.
  - Ui component olarak shadcn ui kullanilmaktadir.
  - Renklendirmeler Tailwind CSS sınıfları ile yapılmalıdır (Örn: `bg-white dark:bg-gray-900`).
  - Tema durumu `src/app/store/themeStore.ts` (veya proje yapısına göre `next-themes`) üzerinden kontrol edilmektedir.

- **Çoklu Dil Desteği (i18n):**
  - **Path:** `src/lib/i18n/` ve çeviri dosyaları `src/lib/i18n/locales/`
  - Desteklenen diller: İngilizce (`en`), Rusça (`ru`), Türkmence (`tk`).
  - Arayüzde hard-coded metin (string) yazmak **yasaktır**. Tüm metinler çeviri dosyalarından `useTranslation` kancası ile çekilmelidir.

## 3. Kod Kalitesi ve TypeScript Kuralları

- **Kesinlikle `any` Kullanımı Yasaktır!**
  - Proje genelinde `any` tipi kullanmak kesinlikle yasaktır (`eslint` kurallarıyla da desteklenmelidir).
  - Tipler tam olarak bilinmiyorsa `unknown` kullanılmalı veya uygun `interface` / `type` tanımlamaları yapılmalıdır.
  - Tüm API yanıtları, payload'lar ve component propları için mutlaka tip tanımlamaları oluşturulmalıdır.

- **Clean Code (Temiz Kod):**
  - Modüler yapı (Feature-Sliced Design) korunmalıdır. Her özellik kendi klasöründe (`src/features/[feature-name]/`) api, hooks, components olarak ayrılmalıdır.
  - Fonksiyonlar tek bir iş yapmalı (Single Responsibility).
  - İsimlendirmeler açıklayıcı olmalı (Örn: `handleData` yerine `submitLoginForm`).

## 4. Dosya Yapısı Özeti

```text
src/
├── app/             # Global provider'lar, store'lar ve router konfigürasyonları
├── assets/          # Görseller, fontlar vb. statik dosyalar
├── components/      # Global ve UI bileşenleri (shadcn vb. ortak bileşenler)
├── features/        # Özellik bazlı modüller (auth, dashboard, users vb.)
│   └── [feature]/
│       ├── api/     # Feature'a özel axios istek fonksiyonları
│       ├── hooks/   # Feature'a özel React Query hook'ları (useQuery, useMutation)
│       └── components/# Feature'a özel bileşenler
├── hooks/           # Global custom hook'lar
├── layouts/         # Sayfa düzenleri (DashboardLayout, AuthLayout vb.)
├── lib/             # API client, i18n ayarları ve utils (yardımcı fonksiyonlar)
└── pages/           # Router tarafından çağrılan ana sayfalar
```

## AI / Agent İçin Katı Talimatlar (System Instructions)

1. Yeni bir bileşen veya özellik ekleneceğinde her zaman önce `src/features/` altına eklenip eklenmeyeceğini değerlendir.
2. UI bileşeni oluştururken önce `src/components/ui/` dizininde mevcut bir yapı olup olmadığını kontrol et.
3. Asla `any` tipi tanımlama. TypeScript hatalarını doğru tipler (interface/type) yazarak çöz.
4. Mutation'lardan (POST, PUT, DELETE) sonra `onSuccess` ve `onError` bloklarında mutlaka `sonner` ile bildirim göster.
5. Kullanıcıya dönen her metni `i18n` dosyalarına ekle ve `t('anahtar')` şeklinde çağır. Hard-coded string kullanma.
6. Kod yazarken temiz, okunabilir ve modüler bir yaklaşım benimse.
7. **Create ve Edit sayfaları için Shared Form Component kullan:**
   - Bir özelliğin create ve edit sayfaları aynı form alanlarını (field) kullanıyorsa, her ikisi için ayrı ayrı form yazmak **yasaktır**.
   - Bunun yerine `src/features/[feature]/components/[Feature]Form.tsx` adında tek bir shared form component'i oluştur ve `mode: 'create' | 'edit'` prop'u ile davranışı ayarla.
   - Create ve Edit sayfaları (`pages/`) sadece bu component'i çağıran birer **wrapper** olmalıdır.
   - Edit sayfası `useParams()` ile URL'den `id` alır, ilgili hook ile veriyi fetch eder ve `initialData` prop'u olarak form'a geçer.
   - Validation, form state, submit logic — hepsi shared component içinde tek yerde yönetilir.
   - Örnek yapı:
     ```
     features/[feature]/
       components/
         [Feature]Form.tsx     ← mode="create" | mode="edit", shared form
       hooks/
         use[Feature]s.ts      ← useCreate, useUpdate, useGetById hook'ları
       api/
         [feature]Api.ts       ← payload tipleri burada tanımlanır
     pages/
       [Feature]CreatePage.tsx ← <[Feature]Form mode="create" />
       [Feature]EditPage.tsx   ← id fetch → <[Feature]Form mode="edit" initialData={data} loanOrderId={id} />
     ```
