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

## Later guidance: one live match, cue control, knockabout, and pub plan

> On the field, I've had this before: you have the cue ball, and as you tap on that screen you're able to move the cue all the way around the screen and all the way around the cue ball. Pulling it away from the cue ball will set the power.
>
> There needs to be something on screen that allows you to change where on the cue ball you hit it, so you can set the spin and backspin. I'm not decided yet whether pulling back is enough to set the power. I think we will keep it casual
>
> House rules, we'll do them both:
>
> - Teams: 2v2
> - The winner stays on
>
> On the fouls, I don't know what the proper rules are. The people who play in pubs just get two shots or something, don't they? I'm not sure. I think if you pot the black, you've lost
>
> If the game's finished but there are still balls on the table, you can both still wander on and smash the balls in. In fact you can even tap on a ball that isn't the cue ball and use it as the one you're going to smash in. At the end of the game, we used to ping the balls in for fun, but then you've got a button to properly re-rack and so on I tell you what: let's just stick to the live single mode, right? Let's not have the one where you can have lots of games going on at the same time. That's just too complicated for now. But it is turn-based so there's no reason why a game couldn't last a long time. But you could have a rule that says if someone takes so long to play, they forfeit and then you get two shots. Regarding the pub detail, I'm going to describe this to you. Imagine you are looking straight down the pub.
>
> At the bottom of the image is the bar, which runs along the back wall, pretty much all the way along it, or along the middle third anyway. To the left of that bar is the pool table, and beyond the pool table and around the bar, there are seats and tables.
>
> Immediately above the bar on this top-down plan is the entrance. People come through a foyer, and the toilets are to the left and right as they come in. Over on the right-hand side of the bar, there is essentially a mirror image, but this time it doesn't have a pool table. It just has people sitting and boozing.

Latest follow-up:

> The landlady's called Betty. She's an absolute battleaxe and she might bar you out as well

### Current interpretation (S1.2 replaces S1.1 where they conflict)

- One live active match, still turn-based and resumable. Multiple simultaneous matches/inbox are deferred explicitly.
- Cue can rotate all the way around the cue ball from touch input; pull-away distance is a candidate power control, not a final mapping. Add cue-ball contact-point control for spin/backspin. Keep the feel casual and preserve same-finger abort.
- Both 2 v 2 and winner-stays-on are desired game formats. Foul details, team rotation and optional time penalties remain unsettled.
- After the competitive result, allow an unscored knockabout, including selecting a non-cue ball to strike. Preserve the final result; explicit re-rack starts the next setup. Both players can participate, but simultaneous shot resolution is not specified.
- Room description provides relative zones, not measurements. Bar is along the bottom/back wall (extent uncertain), pool to its left, seats beyond/around it, foyer immediately above bar with toilets flanking it, and a right social side without a pool table.
- Betty is the named formidable landlady. A barring interlude is a character idea; no likeness, voice, exact dialogue, trigger or gameplay penalty has been supplied.

## Subsequent clarification: design-only scope and pixel caricatures

User: “So right now can we just be clear: are you still in the planning phase, right? You're designing the look and the feel but we're not building an app yet.”

User: “I really would like it to have almost a pixelated look at times, not just for the pool table itself, but definitely for our photos. They need to be caricatures”.

Interpretation: remain in planning/look-and-feel design; no app implementation in this revision. Adopt selective pixelation and recognisable caricature portraits, retaining the selected broadcast framing. First generated concept C1 is a proposal, not approved final likeness. Supersedes straight photo crops in M1.

## Floor-plan correction and design approval

The user approved the floor plan except the entrance/toilet arrangement: move both toilets to the far/top wall beside the entrance doors, with a long foyer opening into the room toward the bottom/back-wall bar. Everything else was described as great. They also said the mockups are really good and the pixelated group shot is great, and requested individual player avatars from it.
