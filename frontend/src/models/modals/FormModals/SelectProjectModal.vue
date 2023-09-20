<template>
  <select
    class="ui fluid search selection dropdown"
    name="project"
    id="project"
  >
  <!-- <select
    class="ui fluid search selection dropdown"
    name="project"
    id="project"
    v-model="$store.state.projects.selectedProjectCode"
  > -->
    <option value="">Project</option>
    <option
      v-for="project in selectableProjects"
      :key="project.code"
      :value="project.code"

    >
      {{ project.name }}
    </option>
  </select>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["user"],
  computed: {
    ...mapGetters(["selectableProjects"]),

    //NA WYPADEK GDYBY TRZEBA BYŁO DODAWAĆ HISTORIĘ TYLKO DLA PROJEKTÓW NA KTÓRYCH UŻYTKOWNIK JEST OBECNIE ZALOGOWANY
    //Teoretycznie jest to bardziej sensowne, ale co jeśli użytkownik kiedyś był na jakimś projekcie, teraz nie jest, a chcemy mu zmodyfikować czas?
    //Na razie koordynator/projekt owner/admin może dodawać/edytować czas na wszystkich projektach nad jakimi ma nadzór i elo

    // filteredProjects() {
    //   let filteredProjects = [];
    //   if (this.user) {
    //     for (const client of this.$store.state.projects.list) {
    //       for (const project of client.projects) {
    //         for (const campaign of project.campaigns) {
    //           for (const user of campaign.users) {
    //             if (user.login == this.user) {
    //               const usersIndex = filteredProjects.findIndex(
    //                 (object) => object.code === project.project_code
    //               );
    //               if (usersIndex === -1) {
    //                 filteredProjects.push({
    //                   code: project.project_code,
    //                   name: project.name,
    //                 });
    //               }
    //             }
    //           }
    //           for (const coordinator of campaign.coordinators) {
    //             if (coordinator.login == this.user) {
    //               const coordinatorsIndex = filteredProjects.findIndex(
    //                 (object) => object.code === project.project_code
    //               );
    //               if (coordinatorsIndex === -1) {
    //                 filteredProjects.push({
    //                   code: project.project_code,
    //                   name: project.name,
    //                 });
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   } else {
    //     filteredProjects = this.selectableProjects;
    //   }

    //   return filteredProjects;
    // },
  },
};
</script>

<style></style>
