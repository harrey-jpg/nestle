# Nestle on Android and iPhone

The app now has Capacitor native projects for both phones. First launch asks “Is this Harry or Alexa?” and remembers the choice without a setup link, once `backend/simple-profile-choice.sql` is applied. Browser development remains at localhost:5173. No APK or signed iPhone build has been produced or physically tested yet.

## Chat

- Text, Unicode emoji picker, JPEG/PNG/WebP photos and animated GIF uploads, up to 10 MB each. GIFs come from the phone's files/photos; there is no online GIF search service.
- Preview and optional caption, private immutable uploads, expiring signed image URLs, live message changes with polling fallback, delivery/seen receipts and per-device notification opt-in.
- An uploaded attachment and its stable message ID survive send failures/reopening. A selected file that has not finished uploading cannot be preserved across closing the app; remove the failed item and attach it again. Draft text stays on the device.
- New messages show a banner while Home is open. Native notification taps open Messages. Visible chat remains quiet.

## Prepare native projects

Run `npm install`, then `npm run mobile:sync`. `npm run mobile:android` opens Android Studio. On a Mac, `npm run mobile:ios` opens Xcode after syncing. The current app ID is `app.nestle.privatehome` for both platforms.

Windows syncs Android and copies iOS web assets. Run `npm run mobile:sync` on the Mac before building iOS; the Firebase Swift package needs the configured symlink. Building requires the Capacitor 8 toolchain, Android API 36, and a compatible JDK. The currently detected Windows setup has API 35 and JDK 25, so Android compilation still needs toolchain setup. iOS compilation/signing requires Xcode on a Mac.

## Activate device notifications

The backend queue, dispatcher and retries are deployed, but push delivery is inactive until the following configuration is supplied. Never put a Firebase service-account private key or APNs key in the web app, source control, or chat.

1. In one Firebase project, register the Android and iOS apps with the app ID above. Download Android `google-services.json` into `android/app/`. Add iOS `GoogleService-Info.plist` to the App target in Xcode and ensure it is copied into the app bundle. These files are ignored by Git.
2. Configure Apple signing and Push Notifications capability for the iOS app. The app includes an APNs entitlement and notification callbacks. Upload the Apple APNs authentication key to Firebase Cloud Messaging for that iOS app. Verify the development/distribution entitlement against the provisioning profile in Xcode.
3. Add the Firebase service-account JSON as Supabase Edge Function secret `FIREBASE_SERVICE_ACCOUNT`. It must have permission to send FCM messages, with the Firebase Cloud Messaging API enabled. This JSON is server-only.
4. Generate one random 32-byte dispatch secret. Save it as Edge Function secret `PUSH_DISPATCH_SECRET`, and save the same value in Supabase Vault under `nestle_push_dispatch_secret`. Database wakeups authenticate with this secret. Without it, database wakeups deliberately do nothing.
5. Sync and build both apps, choose Harry or Alexa on each phone, then tap **Enable notifications** in Messages. Native permission prompts are only requested after this tap and server configuration is present.
6. Test in both directions with the receiving app open, backgrounded and closed; tap a notification from a cold start; deny/re-enable permission; turn notifications off; and confirm a revoked installation receives nothing. Signing, APNs/Firebase delivery and lock-screen behavior have not been validated on physical phones.

## Server behavior

The SQL sources extend the existing approved-device backend in this order: `private-home.sql`, `messages.sql`, `chat-media.sql`, `chat-push.sql`, `chat-push-wakeup.sql`. They depend on the existing device approval tables and helpers; they are initial migrations, not a complete fresh-project bootstrap or rerunnable scripts. The deployed project already has these changes.

`backend/functions/chat-push/index.ts` authenticates a linked approved sender or a server dispatch secret itself; gateway JWT validation is disabled for the database webhook. Anonymous delivery requests return 401. Tokens are installation-owned and hidden from the partner. The message transaction queues only other-profile approved registrations. Jobs are claimed to avoid concurrent duplicate dispatch, and successful sends are recorded. Immediate database wakeups use pg_net; pg_cron retries recent pending jobs every minute, up to ten recorded send attempts within 24 hours. Network delivery is at-least-once: a crash after FCM accepts a push but before recording success can still repeat an alert. Message IDs are used as collapse IDs.

Lock-screen notifications contain only “You have a new private message.” Chat text, attachment URLs and setup links are never included in push payloads. Native configuration alone cannot verify credentials or guarantee OS delivery.

## Validation

Automated media and dispatcher tests cover file signatures, size limits, immutable retry paths, photo-only captions, authorization, private FCM payloads and failed dispatch retries. Isolated browser tests mock the backend and cover mobile/desktop media composition, rendering, reload/retry and notification availability states. Read-only cloud checks confirmed a private bucket, restricted grants/RLS, Realtime publication, retry scheduling and an inactive dispatcher. Production write tests were rejected by automatic approval review; revoked verification devices remain revoked, and no test messages were added to the live chat.

References: [Capacitor](https://capacitorjs.com/docs/getting-started), [Firebase Messaging plugin](https://capawesome.io/docs/sdks/capacitor/firebase/cloud-messaging/), [FCM HTTP v1](https://firebase.google.com/docs/cloud-messaging/send/v1-api).
