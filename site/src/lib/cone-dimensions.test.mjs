import test from "node:test";
import assert from "node:assert/strict";
import records from "../data/records.json" with {type:"json"};
import {extractProductFacts,localizedProductBody} from "./product-facts.mjs";
import {localizedEntry,uiFor} from "./localization.mjs";
import {SECONDARY_SELECTION_NOTES} from "../data/secondary-selection-notes.mjs";
test("confirmed cone dimensions separate body height from sauce compartment height in all languages",()=>{
 for(const id of [276,278]){
  const record=records.find(r=>r.id===id);const facts=extractProductFacts(record);
  assert.deepEqual(facts.tables[0].headers,["Item No.","Cone Height","Sauce Compartment Height","Width","CTN"]);
  assert.deepEqual(facts.tables[0].rows.map(r=>r.slice(1,4)),[["145mm","20mm","117mm"],["165mm","23mm","134mm"],["230mm","28mm","167mm"]]);
  for(const lang of ["fr","es","ar","zh","de"]){const ui=uiFor(lang);assert.ok(ui.specificationHeaders["Cone Height"]);assert.ok(ui.specificationHeaders["Sauce Compartment Height"]);assert.ok(localizedProductBody(localizedEntry(lang,"product:"+record.slug),facts,ui).includes(ui.specificationHeaders["Sauce Compartment Height"]));}
 }
 for(const lang of ["en","fr","es","ar","zh","de"])assert.ok(!SECONDARY_SELECTION_NOTES[lang]["cone-fry-packaging"].text.join(" ").includes("Front/Back Height"));
 assert.ok(records.find(r=>r.id===280).body.includes("Front/Back Height"));
});
