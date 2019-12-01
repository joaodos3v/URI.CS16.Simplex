<template>
  <div class="container-fluid mb-5">
    <h5>Tabela #{{ id }}</h5>
    <table class="table">
      <tbody>
        <tr v-for="(row, rIndex) in table" :key="rIndex">
          <td class="text-center" v-for="(number, nIndex) in row" :key="nIndex"
            :class="[
              {'edge-horizontal': nIndex == 0 || nIndex == row.length - 1},
              {'edge-vertical': rIndex == 0},
              {'edge-bottom': rIndex == table.length - 1},
              {'output': nIndex == outputColumn},
              {'input': rIndex == inputLine},
              {'pivot': nIndex == outputColumn && rIndex == inputLine},
            ]">
            {{ number }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-show="!finished" class="col text-center mb-5">
      <button @click="calculateSolution" class="col-6 btn btn-lg btn-info"><i class="fa fa-arrow-right" aria-hidden="true"></i> CONTINUAR</button>
    </div>
  </div>
</template>


<script>
export default {
  name: "NewTable",
  props: {
    id: Number,
    table: Array,
    outputColumn: Number,
    finished: Boolean,
  },
  computed: {
    inputLine() {
      let column = [];
      let independentTerms = [];
      for (let i = 1; i < this.table.length; i++) {
        const row = this.table[i];
        column.push(row[this.outputColumn]);
        independentTerms.push(row[row.length - 1]);
      }
      
      const results = independentTerms.map((elm, idx) => {
        const result = elm / column[idx];
        return result >= 0 ? result : Number.POSITIVE_INFINITY;
      });

      // Esse '+1' é feito porque no laço, o início é com 1, então a linha da função objetivo não foi considerada
      return results.indexOf(Math.min(...results)) + 1;
    },
    pivot() {
      return this.table[this.inputLine][this.outputColumn];
    }
  },
  methods: {
    calculateSolution() {
      const pivotNumber = this.pivot;
      const newPivotLine = this.table[this.inputLine].map(number => number / pivotNumber);
      window.console.log(">>>>>>>>> Nova Linha Pivô", newPivotLine);

      let newTable = [];
      newTable[this.inputLine] = newPivotLine;
      for (let i = 0; i < this.table.length; i++) {
        if (i != this.inputLine) {
          const tempLine = newPivotLine.map(number => number * (this.table[i][this.outputColumn] * -1));
          const newLine = tempLine.map((number, index) => number + Number(this.table[i][index]));
          newTable[i] = newLine;
        }
      }

      window.console.log("Nova tabela pronta", newTable);
      this.$emit("new-table-ready", newTable);
    }
  }
};
</script>


<style scoped>
.edge-vertical {
  border-top: 2px solid black!important;
  border-bottom: 2px solid black!important;
}

.edge-horizontal {
  border-left: 2px solid black!important;
  border-right: 2px solid black!important;
}

.edge-bottom {
  border-bottom: 2px solid black!important;
}

.output {
  background-color: #94ccdd;
}

.input {
  background-color: #67bad3;
}

.pivot {
  border: 4px solid #080895!important;
}
</style>
