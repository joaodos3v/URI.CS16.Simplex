<template>
  <div class="container-fluid text-center mt-3">
    <div class="alert alert-primary alert-dismissible fade show" role="alert">
      <strong>{{ method }}</strong> {{ description }}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
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