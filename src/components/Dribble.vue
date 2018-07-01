<template lang="pug">
  div
    h1
      .a(v-if="location") {{stuff}} on your {{location}}
      .a(v-else) {{stuff}}
    | Here is some more stuff
</template>
<script>
export default {
  name: 'dribble',
  props: {
    location: String
  },
  data: function () {
    return {
      stuff: 'Dribble a little bit more'
    }
  },
}
</script>
<!-- let's add some style too :) -->
<style scoped lang="scss">

$zeColor : blue;

h1 {
  color: $zeColor;
}
</style>
