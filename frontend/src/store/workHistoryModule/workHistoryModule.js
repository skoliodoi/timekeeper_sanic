// import workHistoryActions from "./workHistoryActions";
const workHistoryModule = {
  state() {
    return {
      displayValue: "user",
      userLogin: "",
      showReturnButton: false,
      hideUserSidebar: false,
      selectedProject: "",
      loadingPage: false,
      displayUserName: "",
      detailsFromProjectView: false,
      showDetails: false,
      allowedToEdit: false,
      projectDataDetails: {},
      projectReturnDetails: {
        returnDate: "",
        returnProject: "",
      },
      dataDetails: {   
      },
      showInfoModal: false,
    }
  },
  // actions: workHistoryActions,
}

export default workHistoryModule;