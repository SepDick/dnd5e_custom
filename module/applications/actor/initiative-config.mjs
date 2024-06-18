import BaseConfigSheet from "./base-config.mjs";

/**
 * A simple sub-application of the ActorSheet which is used to configure properties related to initiative.
 */
export default class ActorInitiativeConfig extends BaseConfigSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e_custom"],
      template: "systems/dnd5e_custom/templates/apps/initiative-config.hbs",
      width: 360,
      height: "auto"
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get title() {
    return `${game.i18n.localize("DND5E.InitiativeConfig")}: ${this.document.name}`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options={}) {
    const source = this.document.toObject();
    const init = source.system.attributes.init || {};
    const flags = source.flags.dnd5e_custom || {};
    return {
      ability: init.ability,
      abilities: CONFIG.DND5E.abilities,
      bonus: init.bonus,
      initiativeAlert: flags.initiativeAlert,
      initiativeAdv: flags.initiativeAdv
    };
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _getSubmitData(updateData={}) {
    const formData = super._getSubmitData(updateData);
    formData.flags = {dnd5e_custom: {}};
    for ( const flag of ["initiativeAlert", "initiativeAdv"] ) {
      const k = `flags.dnd5e_custom.${flag}`;
      if ( formData[k] ) formData.flags.dnd5e_custom[flag] = true;
      else formData.flags.dnd5e_custom[`-=${flag}`] = null;
      delete formData[k];
    }
    return formData;
  }
}
