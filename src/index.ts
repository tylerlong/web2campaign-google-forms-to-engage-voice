import RingCentral from '@rc-ex/core';
import EngageVoiceExtension from '@rc-ex/engage-voice';
import fs from 'fs';
import papaparse from 'papaparse';

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

  const csvString = fs.readFileSync(
    process.env.GOOGLE_FORMS_CSV_FILE!,
    'utf-8'
  );
  const rows = papaparse.parse(csvString).data;
  console.log(rows);
  // const r = await engageVoiceExtension.get('/voice/api/v1/admin/accounts');
  // console.log(r.data);

  await rc.revoke();
})();
