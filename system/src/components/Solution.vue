<template>
  <div>
    <NewTable @new-table-ready="continueIteration" :id="1" :table="makeFirstTable()" :outputColumn="firstOutputColumn" :finished="false" />
    
    <div v-for="(table, index) in tables" :key="index">
      <NewTable @new-table-ready="continueIteration" :id="index + 2" :table="table" :outputColumn="outputColumn" :finished="finished" />
    </div>

    <div v-if="solution" class="jumbotron jumbotron-fluid">
      <div class="container text-center">
        <h1 class="display-8">Solução Ótima (valor de Z) = {{ solution }}</h1>
        <hr class="my-4">
        <button @click="reset" class="btn btn-lg btn-dark"><i class="fa fa-refresh" aria-hidden="true"></i> NOVO CÁLCULO</button>
      </div>
    </div>
  </div>
</template>

<script>
import NewTable from "./NewTable";

export default {
  name: "Solution",
  components: {
    NewTable
  },
  props: {
    method: String,
    data: Object
  },
  data: function() {
    return {
      numExtraTables: 0,
      tables: [],
      outputColumn: 0,
      finished: false,
      solution: null,
    };
  },
  computed: {
    columns() {
      // O número de colunas sempre será o número de restrições (variáveis de folga) + o número de variáveis + 2 (coluna de Z e coluna de termos independentes)
      return this.data.trCoefficients.length + this.data.numberVariables + 2;
    },
    rows() {
      // O número de linhas sempre será o número de restrições técnicas + 1 (função objetivo, que é calcula em 'zLine')
      return this.data.trCoefficients.length;
    },
    firstZLine() {
      let transformedValues = this.data.ofCoefficients.map(coefficient => coefficient * -1);
      let line = [1, ...transformedValues];

      for (let i = 0; i < this.columns; i++) {
        if (!line[i]) {
          line[i] = 0;
        }
      }

      return line;
    },
    firstOutputColumn() {
      const zLine = [...this.firstZLine];
      zLine.shift(); // Coluna Z
      zLine.pop(); // Termo Independente

      return this.firstZLine.indexOf(Math.min(...zLine));
    }
  },
  methods: {
    makeFirstTable() {
      if (this.method == "Simplex Padrão") {       
        let table = [];
        table[0] = this.firstZLine;

        for (let i = 0; i < this.rows; i++) {
          table.push([0, ...this.data.trCoefficients[i], ...this.makeExtraVariables(i)]);
        }
        return table;
      } else {
        return null;
      }
    },
    makeExtraVariables(index) {
      let elements = [...Array(this.data.trCoefficients.length).fill(0), this.data.independentTerms[index]];
      elements[index] = 1;
      return elements;
    },
    makeNextTable(table) {
      const zLine = [...table[0]];
      zLine.shift(); // Coluna Z
      zLine.pop(); // Termo Independente
      this.outputColumn = table[0].indexOf(Math.min(...zLine));

      this.finished = false;
      this.tables.push(table);
    },
    continueIteration(newTable) {
      const zLine = [...newTable[0]];
      zLine.shift(); // Coluna Z
      zLine.pop(); // Termo Independente

      const hasNegative = zLine.some(number => number < 0);
      if (hasNegative) {
        this.makeNextTable(newTable);
      } else {
        this.finished = true;
        this.tables.push(newTable);
        window.console.log("Array de tabelas", this.tables);

        this.showResult(newTable[0]);
      }
    },
    showResult(zLine) {
      this.solution = zLine[zLine.length - 1];
    },
    reset() {
      this.$emit("reset");
    }
  }
};
</script>