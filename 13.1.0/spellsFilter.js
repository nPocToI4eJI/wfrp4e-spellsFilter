Hooks.once("init", function () {
    game.settings.register("wfrp4e-assistant", "enabled", {
		name: game.i18n.localize("WFRP4E.Assistant.spellsFilter.enabled.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.spellsFilter.enabled.Hint"),
		scope: "client",
        config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-assistant", "spellFilter", {
		scope: "client",
		config: false,
		type: String,
		default: game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.All")
	});
	game.settings.register("wfrp4e-assistant", "spellFilterLists", {
		scope: "client",
		config: false,
		type: Object,
		default: {[game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Combat")]: [], [game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Research")]: [], [game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Other")]: []}
	});
});

Hooks.on("renderActorSheetV2", (app, html, sheet) => {
	if (game.settings.get("wfrp4e-assistant", "enabled") && game.user.character?.id == sheet.document.id && sheet.document.hasSpells) {
		let spellsLists = JSON.stringify(sheet.document.itemTypes.spell.filter(s => s.lore.value != 'petty').map(s => ({'name': s.name, 'img': s.img, 'uuid': s.uuid}))).replace(/\"/g, "'");
		let onRightClick = `
			let async = async (spells) => {
				let choice = (await ItemDialog.create(spells, spells.length, {text: game.i18n.localize('WFRP4E.Assistant.spellsFilter.Description') + ' ' + game.settings.get('wfrp4e-assistant', 'spellFilter'), title: game.settings.get('wfrp4e-assistant', 'spellFilter')})).map(s => s.uuid);
				let result = game.settings.get('wfrp4e-assistant', 'spellFilterLists');
				result[game.settings.get('wfrp4e-assistant', 'spellFilter')] = choice;
				game.settings.set('wfrp4e-assistant', 'spellFilterLists', result);

				let elements = this.closest('.list-header').nextElementSibling.children;
				for (let i = 0; i < elements.length; i++) {
					if (!game.settings.get('wfrp4e-assistant', 'spellFilterLists')[game.settings.get('wfrp4e-assistant', 'spellFilter')].includes(elements[i].dataset.uuid)) {elements[i].style.display = 'none'}
					else {elements[i].style.display = 'flex'};
				};
			};
			if (game.settings.get('wfrp4e-assistant', 'spellFilter') != game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.All')) {async(${spellsLists})}
			else {
				let elements = this.closest('.list-header').nextElementSibling.children;
				for (let i = 0; i < elements.length; i++) {elements[i].style.display = 'flex'};
			};
		`;
		let onClick = `
			if (game.settings.get('wfrp4e-assistant', 'spellFilter') == game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.All')) {
				game.settings.set('wfrp4e-assistant', 'spellFilter', game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.Combat'));
				this.innerHTML = '<i class=&quot;fas fa-swords&quot;></i>';

			} else if (game.settings.get('wfrp4e-assistant', 'spellFilter') == game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.Combat')) {
				game.settings.set('wfrp4e-assistant', 'spellFilter', game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.Research'));
				this.innerHTML = '<i class=&quot;fas fa-search&quot;></i>';

			} else if (game.settings.get('wfrp4e-assistant', 'spellFilter') == game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.Research')) {
				game.settings.set('wfrp4e-assistant', 'spellFilter', game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.Other'));
				this.innerHTML = '<i class=&quot;fas fa-ellipsis&quot;></i>';

			} else if (game.settings.get('wfrp4e-assistant', 'spellFilter') == game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.Other')) {
				game.settings.set('wfrp4e-assistant', 'spellFilter', game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.All'));
				this.innerHTML = '<i class=&quot;fas fa-list&quot;></i>';
			};
			this.dataset.tooltip = game.settings.get('wfrp4e-assistant', 'spellFilter');

			let elements = this.closest('.list-header').nextElementSibling.children;
			for (let i = 0; i < elements.length; i++) {
				if (game.settings.get('wfrp4e-assistant', 'spellFilter') != game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.All') && !game.settings.get('wfrp4e-assistant', 'spellFilterLists')[game.settings.get('wfrp4e-assistant', 'spellFilter')].includes(elements[i].dataset.uuid)) {elements[i].style.display = 'none'}
				else {elements[i].style.display = 'flex'};
			};
		`;

		let icon;
		switch (game.settings.get('wfrp4e-assistant', 'spellFilter')) {
			case game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Combat"): {
				icon = "<i class='fas fa-swords'></i>";
				break;
			}
			case game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Research"): {
				icon = "<i class='fas fa-search'></i>"; 
				break;
			}
			case game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Other"): {
				icon = "<i class='fas fa-ellipsis'></i>"; 
				break;
			}
			default: {
				icon = "<i class='fas fa-list'></i>"; 
				break;
			}
		};
		let button = `<a class="list-button" data-tooltip="${game.settings.get("wfrp4e-assistant", "spellFilter")}" onclick="${onClick}" oncontextmenu="${onRightClick}">${icon}</a>`;
		html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-header>.list-name").insertAdjacentHTML("beforeend", button);

		let elements = html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-content").children;
		for (let i = 0; i < elements.length; i++) {
			if (game.settings.get('wfrp4e-assistant', 'spellFilter') != game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.All') && !game.settings.get('wfrp4e-assistant', 'spellFilterLists')[game.settings.get('wfrp4e-assistant', 'spellFilter')].includes(elements[i].dataset.uuid)) {elements[i].style.display = 'none'}
			else {elements[i].style.display = 'flex'};
		};
	};
});