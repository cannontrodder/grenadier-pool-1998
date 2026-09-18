# User review · 18 September 2026 · issue #5

Review surface: https://grenadier-pool-1998-design.cannontrodder.chatgpt.site/boards/comparison (canonical artifact `boards/comparison.html`). Published version 1, source `4de961e3dc01e01fe67d5b644868990355b4d657`; P1 / D1 / B1 / W1. This is the version delivered before the feedback. Device model, orientation, Safari version, and accessibility findings were not supplied; do not infer physical-iPhone validation from the review.

## Raw user feedback

> I have answers:
>
> for the phone preview questions:
>
> 1 - I prefer g01 from sports broadcast
> 2 - same O02 persona actually
>
> I've decided I'm going to go with the sports broadcast as it has that aestehtic I like from that year but must be bvroadcast style. But still - it has to have an alaemtn that it is ina pub so I want the table actiin abnd some elemtns between shots, maybe a pullback 3d isomettric view ofd the puyb with table would be handy - I have not created a 3d mdoel yet so thats somethihgn we need to fill in later - we pull back and show the tabel and opeoiolekl in chairs etc - stepping uyp, doing the 2 v 2 game where you take turns
>
> also we could do killer where the person who wins strays on the challenger pays 50p to play
>
> The sound needs to be liek a 90s pub - I need yout helo with this. typcial; pool sounds really .
>
> One hting - do not constrain the UX - I see buttons for setting power etc - I'm not sure on the mechanics of how to play but i like singkle finger drag and release play -0 with an option to abort that shot - thats the skill

## Interpretation, with certainty preserved

- Explicit choice: Sports Broadcast for G01 gameplay and O02 persona presentation. The user likes its period aesthetic and specifically wants it to remain broadcast style.
- Explicit constraint: this still takes place in a pub; include table action and between-shot character/setting.
- Exploratory treatment: pull back to a 3D/isometric pub view containing the table, seated people, and the next player stepping up. The user says no 3D model exists yet. This does not change the default top-down shot view or require building a model before the touch study.
- Future mode interest: 2 v 2 with players taking turns; and the user's proposed “killer”/winner-stays-on mode, with a 50p challenger/table-entry motif. Exact rules and rotation are not specified. Do not substitute an assumed standard Killer ruleset or implement payment handling.
- Explicit audio direction: 1990s pub atmosphere and typical pool sounds; the user wants help developing this.
- Interaction preference: single-finger drag and release with the ability to abort. The mechanic is deliberately still open. The earlier power/commit buttons are not an approved requirement.
- Not supplied: preferred orientation, measured readability/accessibility findings, exact gesture-to-power mapping, final game rules, room geometry, individual personality traits, or recordings.

## Follow-up feedback during this work

> what elkse to be settled

> I love tghe idea you can have a game in poroigress and resume into each and take turns like somenone playin chess with laods of peopel at once
>
> guidanceL the ui on the right in landscaep mode is too inrtustive and takes up tghe entire screen - make the ux ui work when the table is completel fullscreen with pop up overlays like on tv away from where the User is touching the wcreen and maybe it goes very transparent when interactive with teh tabekl -

This explicitly adds multiple resumable matches/asynchronous turn-taking as a desired experience, and rejects the fixed landscape control rail. Use the available viewport for the table, with transient broadcast overlays away from active touch and reduced opacity during interaction. This updates S1's earlier framing; it does not establish a final gesture mapping, exact opacity, network protocol, or physical-device test result.
