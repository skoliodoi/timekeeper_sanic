<template>
	<div class="ui form">
		<div :class="{ 'two fields': hasAccess }">
			<div class="field">
				<label style="text-align: left">Start date</label>
				<div class="ui calendar" id="history_rangestart">
					<div class="ui input left icon">
						<i class="calendar icon"></i>
						<input type="text" placeholder="Start" />
					</div>
				</div>
			</div>
			<div class="field">
				<label style="text-align: left">End date</label>
				<div class="ui calendar" id="history_rangeend">
					<div class="ui input left icon">
						<i class="calendar icon"></i>
						<input type="text" placeholder="End" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	const { DateTime } = require("luxon");

	export default {
		mounted() {
			$("#history_rangestart").calendar("clear date");
			$("#history_rangeend").calendar("clear date");
			$("#history_rangestart").calendar({
				type: "date",
				firstDayOfWeek: 1,
				maxDate: new Date(),
				text: {
					days: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
					months: [
						"Styczeń",
						"Luty",
						"Marzec",
						"Kwiecień",
						"Maj",
						"Czerwiec",
						"Lipiec",
						"Sierpień",
						"Wrzesień",
						"Październik",
						"Listopad",
						"Grudzień",
					],
				},
				endCalendar: $("#history_rangeend"),
			});
			$("#history_rangeend").calendar({
				type: "date",
				firstDayOfWeek: 1,
				startCalendar: $("#history_rangestart"),
				maxDate: new Date(),
				onChange: this.showDate,
				text: {
					days: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
					months: [
						"Styczeń",
						"Luty",
						"Marzec",
						"Kwiecień",
						"Maj",
						"Czerwiec",
						"Lipiec",
						"Sierpień",
						"Wrzesień",
						"Październik",
						"Listopad",
						"Grudzień",
					],
				},
			});
		},
		data() {
			return {
				today: new Date(),
				displayDate: "",
			};
		},
		computed: {
			returnDate() {
				return this.pickedDate;
			},
			hasAccess() {
				return this.$store.getters.hasAccess;
			},
		},
		methods: {
			showDate() {
				let startDate = DateTime.fromISO(
					new Date($("#history_rangestart").calendar("get date")).toISOString()
				).toFormat("yyyy-MM-dd");

				let endDate = DateTime.fromISO(
					new Date($("#history_rangeend").calendar("get date")).toISOString()
				).toFormat("yyyy-MM-dd");

				this.$store.state.timeFromCalendar.start = startDate;
				this.$store.state.timeFromCalendar.end = endDate;

				// let calendarDate = $("#history_calendar").calendar("get date");
				// this.$store.state.timeFromCalendar = DateTime.fromISO(
				// 	new Date(calendarDate).toISOString()
				// ).toFormat("yyyy-MM-dd");
			},
		},
	};
</script>

<style>
</style>