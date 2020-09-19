import RingCentral from '@rc-ex/core';
import EngageVoiceExtension from '@rc-ex/engage-voice';
import fs from 'fs';
import papaparse from 'papaparse';

const csvString = fs.readFileSync(process.env.GOOGLE_FORMS_CSV_FILE!, 'utf-8');
const rows = papaparse.parse(csvString, {header: true}).data;

const rc = new RingCentral({
  clientId: process.env.ENGAGE_VOICE_CLIENT_ID!,
  clientSecret: process.env.ENGAGE_VOICE_CLIENT_SECRET!,
  server: process.env.ENGAGE_VOICE_RC_SERVER_URL!,
});

const findCampaignByName = async (
  engageVoiceExtension: EngageVoiceExtension,
  name: string
) => {
  let r = await engageVoiceExtension.get('/voice/api/v1/admin/accounts');
  for (const account of r.data) {
    r = await engageVoiceExtension.get(
      `/voice/api/v1/admin/accounts/${account.accountId}/dialGroups`
    );
    for (const dialGroup of r.data) {
      r = await engageVoiceExtension.get(
        `/voice/api/v1/admin/accounts/${account.accountId}/dialGroups/${dialGroup.dialGroupId}/campaigns`
      );
      for (const campaign of r.data) {
        if (campaign.campaignName === name) {
          return {account, dialGroup, campaign};
        }
      }
    }
  }
  throw new Error(`Cannot find the campaign by name "${name}".`);
};

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

  const {account, dialGroup, campaign} = await findCampaignByName(
    engageVoiceExtension,
    process.env.ENGAGE_VOICE_CAMPAIGN_NAME!
  );
  // console.log(campaign);
  const r = await engageVoiceExtension.get(
    `/voice/api/v1/admin/accounts/${account.accountId}/dialGroups/${dialGroup.dialGroupId}/campaigns/${campaign.campaignId}/lists`
  );
  console.log(r.data);

  // await engageVoiceExtension.post(
  //   `/voice/api/v1/admin/accounts/${account.accountId}/campaigns/${campaign.campaignId}/leadLoader/direct`,
  //   {
  //     description: 'Prospect customers',
  //     dialPriority: 'IMMEDIATE',
  //     duplicateHandling: 'REMOVE_FROM_LIST',
  //     listState: 'ACTIVE',
  //     timeZoneOption: 'NOT_APPLICABLE',
  //     uploadLeads: rows.map((row: any) => ({
  //       leadPhone: row['Phone number'],
  //       externId: row['Email'],
  //       firstName: row['Name'].split(/\s+/)[0],
  //       lastName: row['Name'].split(/\s+/)[1],
  //     })),
  //   }
  // );

  await rc.revoke();
})();
