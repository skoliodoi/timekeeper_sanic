<template>

    <div class="field">
      <label style="text-align: left">Work stage start</label>
      <div class="ui action input" v-if="start && !changeStart">
        <input type="text" disabled :value="start" />
        <button class="ui icon button" @click.prevent="changeStart = true">
          <i class="calendar icon"></i>
        </button>
      </div>
      <div
        class="ui calendar"
        id="start_calendar"
        v-show="changeStart || !start"
      >
        <div class="ui input right icon">
          <i class="calendar icon"></i>
          <input type="text" placeholder="Date" name="start_time" />
        </div>
      </div>
    </div>
    <div class="field">
      <label style="text-align: left">Work stage end</label>
      <div class="ui action input" v-if="end && !changeEnd">
        <input type="text" disabled :value="end" />
        <button class="ui icon button" @click.prevent="changeEnd = 'true'">
          <i class="calendar icon"></i>
        </button>
      </div>
      <div class="ui calendar" id="end_calendar" v-show="changeEnd || !end">
        <div
          class="ui input right icon"
          :class="{
            disabled: disableEndTime && !end,
          }"
        >
          <i class="calendar icon"></i>
          <input ref="anyName" type="text" placeholder="Date" name="end_time" />
        </div>
      </div>
    </div>
</template>

<script>
const { DateTime } = require("luxon");
export default {
  mounted() {
    this.initStartCalendar();
    if (this.endDateExisting) {
      let initDate = DateTime.fromSQL(this.start)
        .plus({ minutes: 5 })
        .setLocale("pl")
        .toISO();
      this.initEndCalendar(
        new Date(DateTime.fromSQL(this.end).setLocale("pl").toISO()),
        new Date(initDate)
      );
    }
  },
  data() {
    return {
      changeStart: false,
      changeEnd: false,
      disableEndTime: true,
      selectedStartTime: "",
      selectedEndTime: "",
      calendarData: {
        maxDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          new Date().getHours(),
          new Date().getMinutes()
          // new Date().getTime()
        ),
        days: ["N", "P", "W", "Ś", "C", "P", "S"],
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
    };
  },
  props: ["update", "start", "end"],
  emits: ["emitDates"],
  computed: {
    startDateExisting() {
      return this.start ? true : false;
    },
    endDateExisting() {
      return this.end ? true : false;
    },
  },
  methods: {
    initStartCalendar() {
      $("#start_calendar").calendar({
        type: "datetime",
        maxDate: this.calendarData.maxDate,
        ampm: false,
        firstDayOfWeek: 1,
        initialDate: this.startDateExisting
          ? new Date(DateTime.fromSQL(this.start).setLocale("pl").toISO())
          : null,
        onChange: this.getStartDate,
        text: {
          days: this.calendarData.days,
          months: this.calendarData.months,
        },
      });
    },
    initEndCalendar(date, minDate) {
      // datePlusFive = new Date(date.getTi)
      // console.log(`End date: ${date}`)
      $("#end_calendar").calendar({
        type: "datetime",
        ampm: false,
        enabledDates: [date],
        initialDate: date,
        maxDate: this.calendarData.maxDate,
        minDate,
        firstDayOfWeek: 1,
        onChange: this.getEndDate,
        text: {
          days: this.calendarData.days,
          months: this.calendarData.months,
        },
      });
    },
    getStartDate() {
      let calendarDate = $("#start_calendar").calendar("get date");
      this.selectedStartTime = calendarDate;
      this.disableEndTime = false;
      this.changeEnd = true;
      let initDate = DateTime.fromISO(
        new Date(calendarDate).toISOString()
      ).plus({ minutes: 5 });
      let defaultDate = new Date(initDate);
      if (
        this.selectedEndTime &&
        new Date(calendarDate).getDate() ===
          new Date(this.selectedEndTime).getDate() &&
        new Date(calendarDate).getMonth() ===
          new Date(this.selectedEndTime).getMonth() &&
        new Date(calendarDate).getFullYear() ===
          new Date(this.selectedEndTime).getFullYear() &&
        new Date(calendarDate).getTime() <
          new Date(this.selectedEndTime).getTime()
      ) {
        this.initEndCalendar(this.selectedEndTime, this.selectedEndTime);
        // this.sendDates(this.selectedStartTime, this.selectedEndTime);
      } else if (
        this.endDateExisting &&
        new Date(calendarDate).getDate() === new Date(this.end).getDate() &&
        new Date(calendarDate).getMonth() === new Date(this.end).getMonth() &&
        new Date(calendarDate).getFullYear() ===
          new Date(this.end).getFullYear() &&
        new Date(calendarDate).getTime() < new Date(this.end).getTime()
      ) {
        this.initEndCalendar(
          new Date(DateTime.fromSQL(this.end).setLocale("pl").toISO()),
          new Date(initDate)
        );
        this.selectedEndTime = new Date(DateTime.fromSQL(this.end).setLocale("pl").toISO())
      } else {
        this.initEndCalendar(calendarDate, defaultDate);
        this.selectedEndTime = defaultDate;
      }

      this.sendDates(this.selectedStartTime, this.selectedEndTime);
    },
    getEndDate() {
      let calendarDate = $("#end_calendar").calendar("get date");
      this.selectedEndTime = calendarDate;
      // let user = this.propsData.userId
      // 	? this.propsData.userId
      // 	: this.selected.user;
      // this.initWorkHistory(user, calendarDate);
      if (!this.selectedStartTime) {
        this.selectedStartTime = this.start;
      }
      this.sendDates(this.selectedStartTime, this.selectedEndTime);
    },
    sendDates(start, end) {
      this.$emit("emitDates", start, end);
    },
  },
};
</script>

<style>
</style>