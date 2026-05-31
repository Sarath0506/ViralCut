import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/login_screen.dart';
import '../../features/auth/otp_screen.dart';
import '../../features/campaigns/campaign_detail_screen.dart';
import '../../features/campaigns/campaigns_screen.dart';
import '../../features/campaigns/submit_work_screen.dart';
import '../../features/dashboard/dashboard_shell.dart';
import '../../features/dashboard/dashboard_screen.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/submissions/submission_detail_screen.dart';
import '../../features/submissions/submissions_screen.dart';
import '../../features/wallet/wallet_screen.dart';
import '../../features/wallet/withdraw_screen.dart';
import '../auth/auth_provider.dart';

final _rootKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final isAuthed = ref.watch(authStateProvider);

  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/onboarding',
    redirect: (context, state) {
      final path = state.matchedLocation;
      final isAuthRoute = path.startsWith('/onboarding') ||
          path.startsWith('/login') ||
          path.startsWith('/otp');
      if (!isAuthed && !isAuthRoute) return '/onboarding';
      if (isAuthed && isAuthRoute) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/onboarding',
        builder: (_, __) => const OnboardingScreen(),
      ),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/otp', builder: (_, __) => const OtpScreen()),
      ShellRoute(
        builder: (_, __, child) => DashboardShell(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (_, __) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/campaigns',
            builder: (_, __) => const CampaignsScreen(),
          ),
          GoRoute(
            path: '/submissions',
            builder: (_, __) => const SubmissionsScreen(),
          ),
          GoRoute(
            path: '/wallet',
            builder: (_, __) => const WalletScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/campaigns/:id',
        builder: (_, state) =>
            CampaignDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/campaigns/:id/submit',
        builder: (_, state) =>
            SubmitWorkScreen(campaignId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/submissions/:id',
        builder: (_, state) =>
            SubmissionDetailScreen(id: state.pathParameters['id']!),
      ),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      GoRoute(path: '/withdraw', builder: (_, __) => const WithdrawScreen()),
    ],
  );
});
