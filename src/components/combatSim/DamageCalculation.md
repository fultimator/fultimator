COMPLETE REFERENCE GUIDE FOR THE DAMAGE CALCULATION (WORK IN PROGRESS)

Damage Calculation Flowchart

INPUTS (collect all before processing)

-   Base Damage (number)
    
-   Damage Type (element or untyped)
    
-   NPC Native Affinity to Damage Type (VU / RS / IM / AB / Normal)
    
-   Is NPC Guarding? (Yes / No)
    
-   Current Affinity Modifiers (VU / RS / IM / AB active? any removal locks?)
    
-   Attack Modifiers (Impose or Remove: VU / RS / IM / AB? If it's a removal, is this a lock?) + duration of the modifier (only this attack, until next turn, until next round, all the scene)
    
-   Attack Ignores (VU? RS? IM? AB?)
    

----------

STEP 1: Determine Initial Affinity

-   Start with Native Affinity if there are no current affinity modifiers, otherwise collect the current affinity.
-   Collect if there are any locked affinities (Example: Removed Resistance to Fire and cannot regain it)

----------

STEP 2: Guarding
  -   Is NPC Guarding?
    
    -   Yes:
        
        -   If Affinity = VU → Set to Normal
            
        -   If Affinity = Normal → Set to RS (only if it doesn't have a lock on RS on that type of damage, in that case it remains Normal)
            
        -   If Affinity = RS / IM / AB → No change
            
    -   No → No change
        

----------

STEP 3: Apply Attack Modifiers

- Does this attack Grant or Remove a modifier?
	- Yes:
		- If it's a Grant check whether there's a remove lock on that affinity and type of damage 
			- If it has a lock → No change
			- If it doesn't have a lock → Apply the selected VU / RS / IM / AB → Remove previous modifier if any
		- If it's a Remove (without lock) check whether there's a remove lock on that affinity and type of damage
            - If there's a lock on that affinity → No change since it's already removed
            - If there's no lock on that affinity → Remove the selected VU / RS / IM / AB → Remove previous modifier if any
        - If it's a Remove (with lock) check whether there's a remove lock on that affinity and type of damage
            - If there's a lock on that affinity → No change since it's already removed
            - If there's no lock on that affinity → Remove the selected VU / RS / IM / AB → Remove previous modifier if any → Set lock on that affinity
    - No → No change

----------

STEP 4: Apply "Ignore Affinity" Flags

- Does attack ignore Vulnerability?
    - If Affinity = VU → Set to Normal
- Does attack ignore Resistance?
    - If Affinity = RS → Set to Normal
- Does attack ignore Immunity?
    - If Affinity = IM → Set to Normal
- Does attack ignore Absorption?
    - If Affinity = AB → Set to Normal
        
----------

STEP 5: Calculate Final Multiplier

-   If Affinity = VU → Multiplier = 2
    
-   If Affinity = Normal → Multiplier = 1
    
-   If Affinity = RS → Multiplier = 0.5 (round down)
    
-   If Affinity = IM → Multiplier = 0
    
-   If Affinity = AB → Multiplier = -1
    

----------

STEP 6: Final Damage

-   Final Damage = Base Damage × Multiplier
    
-   If result is negative → treat as healing
    
-   If result is 0 → display as "No effect"
    

----------

STEP 7: Save New Affinity State (if changed)

-   Save imposed / removed / locked affinities