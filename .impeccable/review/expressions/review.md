# Own-character expressions

Implemented 16 expressions for the locally selected character only. First use asks which character is you. Only the owned room character is enabled and shows the picker; partner controls remain disabled. The state module independently rejects partner edits. There is no profile-switch control.

This is local-preview ownership, not authentication. The app has no accounts, server-side user authorization, or partner synchronization. Browser data can be reset by its user; a future shared app must enforce ownership from a signed-in session on the server.

Validation: 12 automated tests pass. Browser checks pass for both ownership choices at desktop/mobile sizes in morning/night lighting, 16 picker choices, own-character and portrait updates, unchanged partner, persistence after reload, rapid selection ordering, failed-image rollback, unavailable-storage fallback, Escape/focus behavior, and exiting fullscreen to open the picker. Captures and results are in this directory.

Mechanical detector: hidden night raster is an intentional lighting layer; loading pulse reflects an actual pending load. Clipped positioned descendants are the room artwork and its scene characters; the expression picker is outside those containers. Token advisories reflect newly added selector type sizes; the palette remains the established day/night system. No clipping or horizontal overflow appeared in the inspected desktop or mobile captures.

Physical-phone validation remains outstanding.
