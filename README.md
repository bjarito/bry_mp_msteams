# MeetingPulse Teams Add-In

## MS Teams with MP Dev
* Check in Manifests/Local/manifest.json if configurationUrl is set to `https://bjarito.github.io/bry_mp_msteams/Home/TabConfigure.html` 
(For now sidepanel is not working on Local MP `https://local.meet.ps:8443`)
* In Local folder, zip the 3 files (e.g., color.png, manifest.json, outline.png)
* In MS teams calendar menu, create a [future] meeting. Meeting title and attendees are required. Hit the Send button
* Click the meeting you have created then click [Edit] button.
* Click the [+] icon button above and a add tab modal will popup.
* Click `Manage apps` > `More apps` > `Manage your apps` > `Upload a custom app`
* Upload the zipped file you have created a while ago.
* Modal will popup and click the `Add to a meeting`
* Select a meeting name (list of meetings in you MS teams). Hit `Set up a tab`
* Login your credentials in MP and select a meeting (list of meetings in your MP) to be embedded to you MS teams meeting. Hit Save
    You can also add new meeting in MP just click the `Manage my meetings` button on top.
