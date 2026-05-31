import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/api/api_client.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/widgets/vc_scaffold.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _codeController = TextEditingController();
  final _nameController = TextEditingController(text: 'Pragnatej');
  bool _loading = false;

  @override
  void dispose() {
    _codeController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final phone =
        GoRouterState.of(context).uri.queryParameters['phone'] ??
            '+919876543210';

    return VcScaffold(
      title: 'Verify OTP',
      showBack: true,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Code sent to $phone'),
            const SizedBox(height: 8),
            Text(
              'In dev, check API console for OTP if WhatsApp is not configured.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _codeController,
              decoration: const InputDecoration(labelText: '6-digit OTP'),
              keyboardType: TextInputType.number,
              maxLength: 6,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Display name (new users)',
              ),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: _loading
                  ? null
                  : () async {
                      setState(() => _loading = true);
                      try {
                        final session = await ref
                            .read(apiClientProvider)
                            .verifyOtp(
                              phone: phone,
                              code: _codeController.text.trim(),
                              displayName: _nameController.text.trim(),
                            );
                        await ref
                            .read(authStateProvider.notifier)
                            .login(session);
                        if (context.mounted) context.go('/dashboard');
                      } on ApiException catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text(e.message)),
                          );
                        }
                      } finally {
                        if (mounted) setState(() => _loading = false);
                      }
                    },
              child: Text(_loading ? 'Verifying…' : 'Verify & continue'),
            ),
          ],
        ),
      ),
    );
  }
}
