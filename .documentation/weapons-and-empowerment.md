# Weapons and Empowerment

This document defines the four weapon families, their attack cadence, and their empowered behavior.
It supersedes the original Dagger, Sword, and Axe lineup.

## Shared weapon rules

- The player starts with **Sword & Shield**.
- A run loadout contains three weapons.
- There are four weapon families, so every loadout leaves at least one family behind.
- Every normal weapon hit has a Physical component, which may be zero.
- A weapon may also have one elemental component: Fire, Ice, or Thunder.
- A single weapon cannot contain two different elements.
- Normal weapon attacks deal damage only. **Empowered techniques may apply statuses.**
- The weapon family defines attack cadence, hit profile, and the core empowerment mechanic.
- The individual weapon defines its Physical and elemental damage and may determine the exact
  empowered spell where specified.

## Attack cadence groups

| Weapon family | Cadence | Normal hit profile | Core empowerment |
| --- | --- | --- | --- |
| Dual Blades | Frequent | Many small hits | Demon Dance |
| Sword & Shield | Medium | Balanced hits | Guard stance |
| Hammer | Rare | One extremely heavy hit | Charged Smash |
| Staff | Medium or rare | Mostly elemental damage | Weapon-specific spell |

Empowerment is not always a timed damage bonus. It can be either:

- A temporary empowered state, such as Demon Dance or Guard stance.
- A special technique triggered when the empowerment bar fills, such as Charged Smash or a Staff
  spell.

Only one weapon can be focused or empowered at a time, following the Focus rules in the main design
document.

## Dual Blades

Dual Blades replace the old Dagger role.

### Normal attacks

- Frequent attacks.
- Multiple small hits.
- Particularly useful against AGI because each evasion charge avoids only one hit.
- Vulnerable to flat DEF because DEF applies to every hit.

### Demon Dance

When empowered, Dual Blades enter **Demon Dance** for a limited duration and attack substantially
more frequently.

The initial Demon Dance increases attack frequency rather than directly increasing damage. Later
skill-board upgrades may:

- Add more hits.
- Increase hit damage during Demon Dance.
- Extend its duration.
- Further improve its attack frequency.

## Sword & Shield

Sword & Shield is the balanced defensive weapon family.

### Normal attacks

- Medium attack frequency.
- Medium-sized, balanced hits.
- No extreme strength or weakness against hit-count mechanics.

### Guard stance

When empowered, Sword & Shield enters **Guard stance** and gains a temporary Physical Barrier.

The initial version grants Physical resistance. Later skill-board upgrades may:

- Improve Physical resistance to Physical immunity.
- Add protection against selected elements.
- Eventually allow absorption.

This protection uses the Barrier and damage-response system. It does not grant accumulating Shield
points.

## Hammer

Hammer replaces the old slow, heavy Axe role.

### Normal attacks

- Rare attacks with a long cooldown.
- One extremely heavy hit.
- Effective against flat DEF.
- Vulnerable to AGI because one evasion charge avoids the entire hit.

### Charged Smash

When the empowerment bar fills, the Hammer triggers **Charged Smash**. It deals increased damage and
applies Stun.

Charged Smash must not lose its value because of the Hammer's long normal cooldown. It should
trigger immediately or otherwise be guaranteed to land rather than expiring before the next attack.

Later skill-board upgrades may:

- Increase Charged Smash damage.
- Increase Stun duration.
- Improve its effectiveness against Stun-resistant enemies.

Stun resistance reduces the Stun duration. Stun immunity prevents it completely; Charged Smash does
not bypass immunity.

## Staff

Staff is the element-focused weapon family.

### Normal attacks

- Deals mostly elemental damage.
- Has only a small Physical component, which may be zero on some Staffs.
- Individual Staffs provide different Fire, Ice, or Thunder options.
- Attack cadence may be medium or rare depending on the final Staff roster.

### Empowered spells

Unlike the other families, a Staff's exact empowered technique is determined by the individual
Staff. Possible empowered spells include:

- Applying Poison.
- Applying Curse.
- One extremely powerful Fire attack.
- Equivalent Ice or Thunder techniques.

The Staff family defines the element-heavy normal attack structure. The individual Staff defines
the empowered spell.

## Status responses

Statuses applied by empowered techniques use three target responses:

| Response | Result |
| --- | --- |
| Normal | The status applies at full strength and duration. |
| Resistant | The status applies with reduced duration or effectiveness. |
| Immune | The status does not apply. |

The exact reduction for resistance is an implementation-balancing value. A resistant target is not
immune: a sufficiently valuable empowered technique still produces a reduced effect.

## Upgrade ownership

Smithy and Barracks progression have different jobs:

- **Smithy upgrades** improve individual weapons and their base damage.
- **Skill-board nodes** improve a weapon family's empowerment mechanic, and also provide damage
  through general nodes (such as **Power +1**) and weapon-specific passive nodes (such as **+2
  Physical damage to Hammers**).

All weapon damage scales with the player's **Power**, so general Power nodes strengthen every
equipped weapon. The exact scaling formula is implementation balancing.

Unique weapons may make rare exceptions to the family mechanic, but it should remain recognizable.

