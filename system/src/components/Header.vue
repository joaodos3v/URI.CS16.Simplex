<template>
  <div>
    <div id="header" class="text-center">
      <h2>{{ title }} <i class="fa fa-check"></i></h2>
      <h3 class="text-secondary">{{ subtitle }}</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: "Header",
  props: {
    title: String,
    subtitle: String
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#header {
  margin-top: 10px;
  margin-bottom: 10px;
}
h1 {
  font-weight: 600;
}
</style>
