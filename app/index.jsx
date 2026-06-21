import { Redirect } from 'expo-router';

// Root path redirects to the login screen.
// Once real auth is wired up (Phase 7), check token here
// and redirect to (tabs)/home if already logged in.
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
