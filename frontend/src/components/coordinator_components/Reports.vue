<template>
	<div id="power-bi">
		<iframe
			title="[VCC] - Timekeeper - MATKA"
			width="100%"
			height="100%"
			src="https://app.powerbi.com/reportEmbed?reportId=652df185-7db3-437e-9fcf-945ff5fc29d4&autoAuth=true&ctid=01f56f7d-c298-4ea3-81dd-9a9acba3756b&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly93YWJpLXdlc3QtZXVyb3BlLWQtcHJpbWFyeS1yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldC8ifQ%3D%3D"
			frameborder="0"
			allowFullScreen="true"
		></iframe>
	</div>
</template>

<script>
	export default {
    mounted() {
			this.$store.state.controlPanel = true;
    }
  };
</script>

<style scoped>
	#power-bi {
		height: calc(100vh - 100px);
		overflow: auto;
	}
</style>