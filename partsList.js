/*
    Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/

/**
 * List of parts for InspectWise Go inspection tool.
 * Each part includes a unique partId and partName for dropdown population.
 * @type {Array<{partId: string, partName: string}>}
 */
export const partsList = [
  { partId: "18-14577-00", partName: "BASE G11 DSL (OVAL)" },
  { partId: "18-18600-00", partName: "BASE TF G12 BK (OVAL)" },
  { partId: "18-17820-00", partName: "BASE TF G12 DWI (OVAL)" },
  { partId: "18-17979-00", partName: "BASE TF166 LWI RP" },
  { partId: "18-17402-03", partName: "BC SFG12 DWI W/MY" },
  { partId: "18-17980-01", partName: "BODY COVER TF166 BK" },
  { partId: "18-15124-00", partName: "BODY CVR TF G12/G13 BK W/MY" },
  { partId: "18-2638-00", partName: "BODY WF1602 (M) WE" },
  { partId: "18-17392-00", partName: "BODY WF1602 LWI (V1)" },
  { partId: "18-17958-00", partName: "BTC CF WE SV TK3 WE SV (KD)" },
  { partId: "18-18662-00", partName: "BTM CVR CF STD TC WE SV SD KD" },
  { partId: "18-14595-00", partName: "G RING 12\" DSL (TY C)" },
  { partId: "18-12823-00", partName: "G RING 12\" DWI (TY C)" },
  { partId: "18-12841-00", partName: "G RING 16\" DMS (TY C)" },
  { partId: "18-12837-00", partName: "G RING 16\" DWI (TY C)" },
  { partId: "18-12834-00", partName: "G RING 16\" WE (TY C)" },
  { partId: "18-17179-00", partName: "G RING 18\" DCM (TYA)" },
  { partId: "18-16737-00", partName: "G RING 18\" DMC (TYA)" },
  { partId: "18-14450-00", partName: "G RING 18\" WE (TYA)" },
  { partId: "18-16515-00", partName: "GOR BASE DCM TYE TD SD BK KD" },
  { partId: "18-17210-00", partName: "GOR BASE LG TYE NL SD BK ML" },
  { partId: "18-17574-00", partName: "GOR BASE WE TYE NL SD BK AZ" },
  { partId: "18-17484-00", partName: "GOR INSERT TD TYE SD SP-CHR SR" },
  { partId: "18-18601-00", partName: "GOR TYG BK SD WE HT" },
  { partId: "18-17711-00", partName: "GOR TYG BK SD WE KD" },
  { partId: "18-17311-00", partName: "GOR TYG DG SD SR ML" },
  { partId: "18-17085-00", partName: "GOR TYG LG SD BK KD" },
  { partId: "18-17310-00", partName: "GOR TYG LWI SD BK KD" },
  { partId: "18-18231-00", partName: "GORBASE DMC TYE TD SD WE KD" },
  { partId: "18-16131-00", partName: "GORBASE WE TYE NL SD BK KD R1" },
  { partId: "18-17147-00", partName: "NECK JOINT 12\"&16\" TYC DG" },
  { partId: "18-17124-00", partName: "NECK JOINT 12\"&16\" TYC DWI" },
  { partId: "18-17715-00", partName: "NECK JOINT 12\"&16\" TYD BK" },
  { partId: "18-17399-00", partName: "NECK JOINT 12\"&16\" TYD DWI" },
  { partId: "18-17497-00", partName: "NECK JOINT 12\"&16\" TYD DWI RP" },
  { partId: "18-1080-00", partName: "NYLON PLATE BK" },
  { partId: "18-17400-00", partName: "NYLON WSR OD14.2XID10.5Xt1.0" },
  { partId: "18-16108-00", partName: "REAR G LOCK 12\"&16\" BK TYPE C" },
  { partId: "18-15658-00", partName: "REAR G LOCK 12\"&16\" SW TYPE C" },
  { partId: "18-17713-00", partName: "RMC WF TC W/OSC BK (RY)" },
  { partId: "18-17458-00", partName: "RMC WF TC W/OSC DG FR (RY)" },
  { partId: "18-17762-00", partName: "RMC WF TC W/OSC LG (RY)" },
  { partId: "18-17125-00", partName: "RMC WF TC W/OSC LWI (RY)" },
  { partId: "18-17666-00", partName: "RMC WF TC W/OSC LWI RP (RY)" },
  { partId: "18-17043-00", partName: "SPINNER 12\" & 16\" BK TYPE C" },
  { partId: "18-15654-00", partName: "SPINNER 12\" & 16\" SW TYPE C" },
  { partId: "18-11628-00", partName: "STAND BASE TF128/168 LWI" },
  { partId: "18-15549-00", partName: "STAND BODY G10/G11 LSL R1" },
  { partId: "18-1978-01", partName: "STAND BODY TF16 DWI RP KD" },
  { partId: "18-17978-01", partName: "STAND BODY TF166 DWI RP KD" },
  { partId: "18-17401-03", partName: "SW PANEL SFG12 W/NUT LWI KD" }
].filter(part => 
  typeof part.partId === 'string' && part.partId.trim() !== '' &&
  typeof part.partName === 'string' && part.partName.trim() !== ''
);

if (partsList.length === 0) {
  console.error('No valid parts found in partsList.');
}