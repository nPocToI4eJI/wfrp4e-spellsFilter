//Регистрация настроек
Hooks.once("init", function () {
    game.settings.register("wfrp4e-spellsFilter", "enabled", {
		name: game.i18n.localize("WFRP4E.Assistant.spellsFilter.enabled.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.spellsFilter.enabled.Hint"),
		scope: "client",
        config: true,
		type: Boolean,
		default: true
	});
	game.settings.register("wfrp4e-spellsFilter", "spellsFilter", {
		scope: "client",
		config: false,
		type: String,
		default: game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.All")
	});
	game.settings.register("wfrp4e-spellsFilter", "spellsFilterLists", {
		scope: "client",
		config: false,
		type: Object,
		default: {}
	});
	game.settings.register("wfrp4e-spellsFilter", "hidePetty", {
		scope: "client",
		config: false,
		type: Boolean,
		default: false
	});
});

//Проверка правильного перевода фильтров
Hooks.once("ready", function () {
	let filters = [game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.All"), game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Combat"), game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Research"), game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Other")]
	if (!filters.includes(game.settings.get("wfrp4e-spellsFilter", "spellsFilter"))) {
		game.settings.set("wfrp4e-spellsFilter", "spellsFilter", game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.All"));
		let newFilters = {};
		for (let id in game.settings.get("wfrp4e-spellsFilter", "spellsFilterLists")) {
			let values = Object.values(game.settings.get("wfrp4e-spellsFilter", "spellsFilterLists")[id]);
			Object.assign(newFilters, {[id]: {[game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Combat")]: values[0], [game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Research")]: values[1], [game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Other")]: values[2]}});
		};
		game.settings.set("wfrp4e-spellsFilter", "spellsFilterLists", newFilters);
	};
});

Hooks.on("renderActorSheetV2", (app, html, sheet) => {
	if (game.settings.get("wfrp4e-spellsFilter", "enabled") && sheet.document.hasSpells) {
		//Фильтр Заклинаний

		//Функция обновления отображения Заклинаний
		function updateSpells(id) {
			let spells = html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-content").children;
			for (let i = 0; i < spells.length; i++) {
				let filter = game.settings.get("wfrp4e-spellsFilter", "spellsFilterLists")[id] || false;
				if (filter) {filter = filter[game.settings.get("wfrp4e-spellsFilter", "spellsFilter")]?.includes(spells[i].dataset.uuid)}
				else {filter = false};
				if (game.settings.get("wfrp4e-spellsFilter", "spellsFilter") != game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.All") && !filter) {spells[i].style.display = "none"}
				else {spells[i].style.display = "flex"};
			};
		};
		//Определение начального фильтра
		let iconSpells;
		switch (game.settings.get("wfrp4e-spellsFilter", "spellsFilter")) {
			case game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Combat"): iconSpells = "<i class='fas fa-swords'></i>"; break;
			case game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Research"): iconSpells = "<i class='fas fa-search'></i>"; break;
			case game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Other"): iconSpells = "<i class='fas fa-ellipsis'></i>"; break;
			default: iconSpells = "<i class='fas fa-list'></i>"; break;
		};
		//Создание кнопки
		html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-header>.list-name").insertAdjacentHTML("afterbegin", `<a class="list-button" data-action="spellsFilter" data-tooltip="<h6 style='text-align: center;'>${game.settings.get('wfrp4e-spellsFilter', 'spellsFilter')}</h6>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint")}">${iconSpells}</a>`);
		//Обновление отображения Заклинаний
		updateSpells(sheet.document.id);

		//Добавление событий нажатия
		let a = html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-header>.list-name>a[data-action='spellsFilter']");
		//ЛКМ
		a.addEventListener("click", function() {
			//Обновление отображаемого фильтра
			switch (game.settings.get("wfrp4e-spellsFilter", "spellsFilter")) {
				case game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Combat"): {
					game.settings.set("wfrp4e-spellsFilter", "spellsFilter", game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Research"));
					this.innerHTML = "<i class='fas fa-search'></i>";
					break;
				}
				case game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Research"): {
					game.settings.set("wfrp4e-spellsFilter", "spellsFilter", game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Other"));
					this.innerHTML = "<i class='fas fa-ellipsis'></i>";
					break;
				}
				case game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Other"): {
					game.settings.set("wfrp4e-spellsFilter", "spellsFilter", game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.All"));
					this.innerHTML = "<i class='fas fa-list'></i>";
					break;
				}
				default: {
					game.settings.set("wfrp4e-spellsFilter", "spellsFilter", game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Combat"));
					this.innerHTML = "<i class='fas fa-swords'></i>";
					break;
				}
			};
			//Изменение кнопки
			this.dataset.tooltip = `<h6 style="text-align: center;">${game.settings.get("wfrp4e-spellsFilter", "spellsFilter")}</h6>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint")}`;
			//Обновление отображения Заклинаний
			updateSpells(sheet.document.id);
		});
		//ПКМ
		a.addEventListener("contextmenu", async function() {
			if (game.settings.get("wfrp4e-spellsFilter", "spellsFilter") != game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.All")) {
				//Выбор Заклинаний для фильтра
				let spellsLists = sheet.document.itemTypes.spell.filter(s => s.lore.value != "petty").map(s => ({name: s.name, img: s.img, uuid: s.uuid}));
				let choice = (await ItemDialog.create(spellsLists, spellsLists.length, {text: `${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Description")} ${game.settings.get("wfrp4e-spellsFilter", "spellsFilter")}`, title: game.settings.get("wfrp4e-spellsFilter", "spellsFilter")})).map(s => s.uuid);
				//Обновление сохранённых параметров
				let result = game.settings.get("wfrp4e-spellsFilter", "spellsFilterLists");
				if (!result[sheet.document.id]) {Object.assign(result, {[sheet.document.id]: {[game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Combat")]: [], [game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Research")]: [], [game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Other")]: []}})};
				result[sheet.document.id][game.settings.get("wfrp4e-spellsFilter", "spellsFilter")] = choice;
				game.settings.set("wfrp4e-spellsFilter", "spellsFilterLists", result);
				//Обновление отображения Заклинаний
				updateSpells(sheet.document.id);
			};
		});

		//Скрытие Простейших

		//Функция обновления отображения Простейших
		function updatePetty(id) {
			let spells = html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-content").children;
			for (let i = 0; i < spells.length; i++) {
				if (game.settings.get("wfrp4e-spellsFilter", "hidePetty")) {spells[i].style.display = "none"}
				else {spells[i].style.display = "flex"};
			};
		};
		//Определение начальной кнопки
		let iconPetty;
		if (game.settings.get("wfrp4e-spellsFilter", "hidePetty")) {iconPetty = "<i class='fas fa-eye'></i>"}
		else {iconPetty = "<i class='fas fa-eye-slash'></i>"};
		//Создание кнопки
		html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-header>.list-name").insertAdjacentHTML("afterbegin", `<a class="list-button" data-action="hidePetty" data-tooltip="<h6 style='text-align: center;'>${game.settings.get('wfrp4e-spellsFilter', 'hidePetty') ? game.i18n.localize("WFRP4E.Assistant.spellsFilter.hidePetty.Show") : game.i18n.localize("WFRP4E.Assistant.spellsFilter.hidePetty.Hide")}</h6>">${iconPetty}</a>`);
		//Обновление отображения Простейших
		updatePetty(sheet.document.id);
		
		//Добавление события нажатия ЛКМ
		html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-header>.list-name>a[data-action='hidePetty']").addEventListener("click", function() {
			//Обновление настройки и кнопки
			if (game.settings.get("wfrp4e-spellsFilter", "hidePetty")) {
				game.settings.set("wfrp4e-spellsFilter", "hidePetty", false);
				this.dataset.tooltip = `<h6 style="text-align: center;">${game.i18n.localize("WFRP4E.Assistant.spellsFilter.hidePetty.Hide")}</h6>`;
				this.innerHTML = "<i class='fas fa-eye-slash'></i>";
			}
			else {
				game.settings.set("wfrp4e-spellsFilter", "hidePetty", true);
				this.dataset.tooltip = `<h6 style="text-align: center;">${game.i18n.localize("WFRP4E.Assistant.spellsFilter.hidePetty.Show")}</h6>`;
				this.innerHTML = "<i class='fas fa-eye'></i>";
			};
			//Обновление отображения Простейших
			updatePetty(sheet.document.id);
		});
	};
});