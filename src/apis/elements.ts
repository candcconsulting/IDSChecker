/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *
 * This code is for demonstration purposes and should not be considered production ready.
 *--------------------------------------------------------------------------------------------*/
import { HideIsolateEmphasizeManager } from "@itwin/appui-react";
import { ColorDef, FeatureOverrideType, FeatureAppearance } from "@itwin/core-common";
import { EmphasizeElements } from "@itwin/core-frontend";

export function colorModels(vp : any, elementId: string) {
        
    const featureAppearance = FeatureAppearance.fromJSON({ rgb: {r: 255, g : 0, b: 0} , emphasized: true } as FeatureAppearance);
    // HideIsolateEmphasizeManager.overrideModel(vp, elementId, featureAppearance);
    vp.overrideModelAppearance(elementId, featureAppearance);
 }


export const colourElements = (
  vp: any,
  elementSet: any,
  clear?: boolean,
  colour?: any
) => {
  const emph = EmphasizeElements.getOrCreate(vp);
  if (clear) {
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
  }
  if (!colour) {
    colour = ColorDef.fromString("red");
  }
  //const allElements = ecResult;
  let allElements = [];
  if (typeof elementSet === "string") {
    allElements = elementSet.split(",");
  } else {
    allElements = elementSet;
  }

  emph.overrideElements(
    allElements,
    vp,
    colour,
    FeatureOverrideType.ColorOnly,
    true
  );
  emph.emphasizeElements(allElements, vp, undefined, true);
};

export const colourIsolateElements = (
  vp: any,
  elementSet: any,
  clear?: boolean,
  colour?: any
) => {
  const emph = EmphasizeElements.getOrCreate(vp);
  if (clear) {
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
  }
  if (!colour) {
    colour = ColorDef.fromString("red");
  }
  //const allElements = ecResult;
  let allElements = [];
  if (typeof elementSet === "string") {
    allElements = elementSet.split(",");
  } else {
    allElements = elementSet;
  }

  emph.overrideElements(
    allElements,
    vp,
    colour,
    FeatureOverrideType.ColorOnly,
    true
  );
  emph.isolateElements(allElements, vp);
};





export const hideElements = (vp: any, elementSet: any) => {
  const emph = EmphasizeElements.getOrCreate(vp);
  emph.clearEmphasizedElements(vp);
  emph.clearOverriddenElements(vp);
  //const allElements = ecResult;
  let allElements = [];
  if (typeof elementSet === "string") {
    allElements = elementSet.split(",");
  } else {
    allElements = elementSet;
  }

  emph.hideElements(allElements, vp);
};

export const resetElements = (vp: any, clearHidden = true) => {
  const emph = EmphasizeElements.getOrCreate(vp);
  emph.clearEmphasizedElements(vp);
  emph.clearOverriddenElements(vp);
  if (clearHidden) {
    emph.clearHiddenElements(vp);
  }
  
  for (const model of vp.view.iModel.models) {
    vp.dropModelAppearanceOverride(model.id);
  }
  HideIsolateEmphasizeManager.clearOverrideModels(vp);
  // HideIsolateEmphasizeManager.processClearOverrideModels(vp);
  HideIsolateEmphasizeManager.clearEmphasize(vp);

};
