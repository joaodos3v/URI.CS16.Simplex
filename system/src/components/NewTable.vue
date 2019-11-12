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
  </div>
</template>


<script>
export default {
  name: "NewTable",
  props: {
    id: Number,
    table: Array,
    outputColumn: Number,
  },
  data: function() {
    return {
    };
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
        return result >= 0 ? result : 0;
      });

      // Esse '+1' é feito porque no laço eu inicio com 1, então a linha da função objetivo não foi considerada
      const inputLine = results.indexOf(Math.min(...results)) + 1;

      this.calculateSolution();
      return inputLine;
    },
    pivot() {
      return this.table[this.inputLine][this.outputColumn];
    }
  },
  methods: {
    calculateSolution() {
      alert("sdusahduahds");
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
