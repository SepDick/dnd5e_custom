import Advancement from "../../documents/advancement/advancement.mjs";

/**
 * Presents a list of advancement types to create when clicking the new advancement button.
 * Once a type is selected, this hands the process over to the advancement's individual editing interface.
 *
 * @param {Item5e} item             Item to which this advancement will be added.
 * @param {object} [dialogData={}]  An object of dialog data which configures how the modal window is rendered.
 * @param {object} [options={}]     Dialog rendering options.
 */
export default class AdvancementSelection extends Dialog {
  constructor(item, dialogData={}, options={}) {
    super(dialogData, options);

    /**
     * Store a reference to the Item to which this Advancement is being added.
     * @type {Item5e}
     */
    this.item = item;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e_custom", "sheet", "advancement"],
      template: "systems/dnd5e_custom/templates/advancement/advancement-selection.hbs",
      title: "DND5E.AdvancementSelectionTitle",
      width: 500,
      height: "auto"
    });
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  get id() {
    return `item-${this.item.id}-advancement-selection`;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  getData() {
    const context = { types: {} };
    for ( let [name, config] of Object.entries(CONFIG.DND5E.advancementTypes) ) {
      if ( config.prototype instanceof Advancement ) {
        foundry.utils.logCompatibilityWarning(
          "Advancement type configuration changed into an object with `documentClass` defining the advancement class.",
          { since: "DnD5e 3.1", until: "DnD5e 3.3", once: true }
        );
        config = {
          documentClass: config,
          validItemTypes: config.metadata.validItemTypes
        };
      }
      const advancement = config.documentClass;
      if ( config.hidden || !config.validItemTypes?.has(this.item.type) ) continue;
      context.types[name] = {
        label: advancement.metadata.title,
        icon: advancement.metadata.icon,
        hint: advancement.metadata.hint,
        disabled: !advancement.availableForItem(this.item)
      };
    }
    context.types = dnd5e_custom.utils.sortObjectEntries(context.types, "label");
    return context;
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.on("change", "input", this._onChangeInput.bind(this));
  }

  /* -------------------------------------------- */

  /** @inheritDoc */
  _onChangeInput(event) {
    const submit = this.element[0].querySelector("button[data-button='submit']");
    submit.disabled = !this.element[0].querySelector("input[name='type']:checked");
  }

  /* -------------------------------------------- */

  /**
   * A helper constructor function which displays the selection dialog and returns a Promise once its workflow has
   * been resolved.
   * @param {Item5e} item                         Item to which the advancement should be added.
   * @param {object} [config={}]
   * @param {boolean} [config.rejectClose=false]  Trigger a rejection if the window was closed without a choice.
   * @param {object} [config.options={}]          Additional rendering options passed to the Dialog.
   * @returns {Promise<AdvancementConfig|null>}   Result of `Item5e#createAdvancement`.
   */
  static async createDialog(item, { rejectClose=false, options={} }={}) {
    return new Promise((resolve, reject) => {
      const dialog = new this(item, {
        title: `${game.i18n.localize("DND5E.AdvancementSelectionTitle")}: ${item.name}`,
        buttons: {
          submit: {
            callback: html => {
              const formData = new FormDataExtended(html.querySelector("form"));
              const type = formData.get("type");
              resolve(item.createAdvancement(type));
            }
          }
        },
        close: () => {
          if ( rejectClose ) reject("No advancement type was selected");
          else resolve(null);
        }
      }, foundry.utils.mergeObject(options, { jQuery: false }));
      dialog.render(true);
    });
  }

}
