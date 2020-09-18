import RingCentral from '@rc-ex/core';
import EngageVoiceExtension from '@rc-ex/engage-voice';

const rc = new RingCentral({
  clientId: process.env.ENGAGE_VOICE_CLIENT_ID!,
  clientSecret: process.env.ENGAGE_VOICE_CLIENT_SECRET!,
  server: process.env.ENGAGE_VOICE_RC_SERVER_URL!,
});

(async () => {
  await rc.authorize({
    username: process.env.ENGAGE_VOICE_USERNAME!,
    extension: process.env.ENGAGE_VOICE_EXTENSION!,
    password: process.env.ENGAGE_VOICE_PASSWORD!,
  });
  const engageVoiceExtension = new EngageVoiceExtension({
    server: process.env.ENGAGE_VOICE_SERVER_URL,
  });
  await rc.installExtension(engageVoiceExtension);
  await engageVoiceExtension.authorize();

  const r = await engageVoiceExtension.get('/voice/api/v1/admin/accounts');
  console.log(r.data);

  await rc.revoke();
})();
