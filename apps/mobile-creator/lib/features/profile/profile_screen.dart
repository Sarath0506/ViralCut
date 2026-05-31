import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_client.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/widgets/vc_scaffold.dart';
import '../../theme/theme_provider.dart';

final profileProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ref.read(apiClientProvider).fetchMe();
});

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(profileProvider);
    final themeMode = ref.watch(themeModeProvider);

    return VcScaffold(
      title: 'Profile',
      showBack: true,
      body: profile.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('$e')),
        data: (me) => ListView(
          padding: const EdgeInsets.all(20),
          children: [
            ListTile(
              leading: const CircleAvatar(child: Icon(Icons.person)),
              title: Text(me['displayName'] as String? ?? 'Creator'),
              subtitle: Text(me['phone'] as String? ?? ''),
            ),
            SwitchListTile(
              title: const Text('Dark mode'),
              value: themeMode == ThemeMode.dark,
              onChanged: (_) => ref.read(themeModeProvider.notifier).toggle(),
            ),
            ListTile(
              title: const Text('KYC'),
              subtitle: Text('Status: ${me['kycStatus']}'),
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () async {
                await ref.read(authStateProvider.notifier).logout();
              },
              child: const Text('Log out', style: TextStyle(color: Colors.red)),
            ),
          ],
        ),
      ),
    );
  }
}
