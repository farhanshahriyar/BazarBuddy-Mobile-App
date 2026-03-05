# BazarBuddy Mobile App

BazarBuddy is a React Native mobile application built with Expo to help you manage your shopping lists smoothly and efficiently.

## Tech Stack

- **Framework:** React Native & [Expo](https://expo.dev/)
- **Routing:** Expo Router (File-based routing)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Backend / Database:** [Supabase](https://supabase.com/)
- **Icons:** Lucide React Native
- **Language:** TypeScript

## Features

- **User Authentication:** Secure login, signup, and password recovery via Supabase Auth.
- **List Management:** Create, view, and manage your shopping (bazar) lists.
- **Item Tracking:** Add items to lists and track your shopping progress.
- **Analytics:** View insights and past shopping analytics.
- **Modern UI:** Clean, responsive design built with Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app installed on your physical device (iOS/Android), or an emulator/simulator.

### Installation

1.  Clone the repository and jump into the `client` directory.
2.  Install the dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

3.  Set up your environment variables. Create a `.env.local` file in the root of the `client` directory (or use the hardcoded backups in `lib/supabase.ts` for quick testing if configured):

    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

### Running the App

Start the Expo development server:

```bash
npx expo start -c
```

The `-c` flag clears the cache to ensure all latest environment variables and dependencies are loaded correctly.

Once the server is running, you can:

- Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android).
- Press `a` to open in Android Emulator.
- Press `i` to open in iOS Simulator.
- Press `w` to open in a web browser.

## Project Structure

- `app/`: Contains the file-based routing components (Screens like Auth, Tabs, Modals).
- `components/`: Reusable UI components.
- `lib/`: Core utilities, including the `supabase.ts` client setup.
- `assets/`: Images, fonts, and other static files.
