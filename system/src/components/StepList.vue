<template>
  <div class="container-fluid p-5">
    <div class="card mb-5" v-for="step in steps" :key="step.caption">
      <div class="card-header"><h6>{{ step.caption }}</h6></div>
      <div class="card-body">
        <table class="table table-sm table-borderless">
          <tbody>
            <tr v-for="(row, i) in step.rows" :key="i + Math.floor((Math.random() * 10000) + 1)" 
              :class="{'border-top': i == step.rows.length - 1, 'border-bottom': i == 0}">
              <td v-for="elm in row" :key="elm + Math.floor((Math.random() * 10000) + 1)">{{ elm }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "StepList",

  props: {
    table: Array,
    pivot: Number,
    inputColumnIndex: Number,
    outputLineIndex: Number,
  },

  created() {
    if (this.inputColumnIndex && this.outputLineIndex) {
      const newPivotLine = this.table[this.outputLineIndex].map(number => number / this.pivot);
      const newPivotLineStep = [
        ["", ...this.table[this.outputLineIndex]],
        [`/ (${this.pivot})`, ...newPivotLine]
      ];
      this.addStep("Nova Linha Pivô", newPivotLineStep);

      for (let i = 0; i < this.table.length; i++) {
        if (i != this.outputLineIndex) {
          const tempLine = newPivotLine.map(number => number * (this.table[i][this.inputColumnIndex] * -1));
          const newLine = tempLine.map((number, index) => number + Number(this.table[i][index]));
          const caption = i === 0 ? "LINHA Z" : `${i}ª LINHA`;
          const newStep = [
            ["NLP: ", ...newPivotLine],
            [`. (${this.table[i][this.inputColumnIndex] * -1})`, ...tempLine],
            [`+ ${caption}: `, ...this.table[i]],
            [`NOVA ${caption}: `, ...newLine]
          ];
          this.addStep(caption, newStep);
        }
      }
    }    
  },

  data: function() {
    return {
      steps: []
    };
  },

  methods: {
    addStep(caption, rows) {
      const newStep = {
        caption: caption,
        rows: rows
      };

      this.steps.push(newStep);
    }
  },
};
</script>

<style scoped>
  tr.border-top {
    background-color: beige;
  }
</style>