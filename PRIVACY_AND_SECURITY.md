# Privacy and Security

This version intentionally uses no security boundary.

- The password is hardcoded in the client application.
- Trip details and booking codes are bundled as plaintext application data.
- The login screen is a convenience check, not authentication.
- Browser developer tools or downloaded build files reveal the password and data.
- Do not publish this build if the included information should remain private.

Photos and journal notes added on-device are stored locally (IndexedDB / localStorage)
without encryption in this simplified build. The app does not upload them and does not
scan the photo library unless the user picks files.

This behavior is an explicit simplification requested for the dedicated family-trip site.
