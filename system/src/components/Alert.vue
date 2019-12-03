<template>
  <div class="container-fluid text-center mt-3">
    <div class="alert alert-primary alert-dismissible fade show" role="alert">
      <strong>{{ method }}</strong> {{ description }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Alert",
  props: {
    method: String,
    description: String
  }
};
</script>