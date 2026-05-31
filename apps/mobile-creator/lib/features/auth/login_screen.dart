import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_client.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/widgets/vc_scaffold.dart';

final _phoneProvider = StateProvider<String>((ref) => '+919876543210');

class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final phone = ref.watch(_phoneProvider);

    return VcScaffold(
      title: 'Log in',
      showBack: true,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Welcome back',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 8),
            const Text('Continue earning from your clips.'),
            const SizedBox(height: 24),
            TextField(
              decoration: const InputDecoration(
                labelText: 'PHONE (+91)',
                hintText: '+919876543210',
              ),
              keyboardType: TextInputType.phone,
              onChanged: (v) =>
                  ref.read(_phoneProvider.notifier).state = v.trim(),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () async {
                try {
                  await ref.read(apiClientProvider).requestOtp(phone);
                  if (context.mounted) {
                    context.push('/otp?phone=${Uri.encodeComponent(phone)}');
                  }
                } on ApiException catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(e.message)),
                    );
                  }
                }
              },
              child: const Text('Send OTP'),
            ),
          ],
        ),
      ),
    );
  }
}
