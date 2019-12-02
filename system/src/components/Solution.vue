<template>
  <div>
    <div v-for="(iteration, index) in iterations" :key="index">
      <NewTable @new-table-ready="continueIteration" :id="index + 1" :table="iteration.table" 
        :inputColumnIndex="iteration.inputColumnIndex" :outputLineIndex="iteration.outputLineIndex" :finished="finished" />
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

  created() {      
    this.zLine = this._getInitialZLine();
    const inputColumnIndex = this._getInputColumnIndex();
    this.makeFirstTable(inputColumnIndex);
  },

  data: function() {
    return {
      iterations: [],
      solution: null,
      zLine: [],
      finished: false,
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
  },

  methods: {
    showResult(zLine) {
      this.solution = zLine[zLine.length - 1];
    },
    reset() {
      this.iterations = [];
      this.solution = null;
      this.zLine = [];
      this.finished = false;
      this.$emit("reset");
    },
    _getInitialZLine() {
      let transformedValues = this.data.ofCoefficients.map(coefficient => coefficient * -1);
      let initialZLine = [1, ...transformedValues];
      for (let i = 0; i < this.columns; i++) {
        if (!initialZLine[i]) {
          initialZLine[i] = 0;
        }
      }

      return initialZLine;
    },
    _getZLine(row) {
      const zLine = [...row];
      zLine.shift();  // Coluna Z
      zLine.pop();    // Termo Independente
      return zLine;
    },
    _getInputColumnIndex() {
      const zLineCoefficients = this._getZLine(this.zLine);
      return this.zLine.indexOf(Math.min(...zLineCoefficients));
    },
    _getOutputLineIndex(inputColumnIndex, independentTerms, tableRows) {
      let inputColumnElements = [];
      for (let i = 0; i < tableRows.length; i++) {
        inputColumnElements.push(tableRows[i][inputColumnIndex]); 
      }

      const results = independentTerms.map((elm, idx) => {
        const result = elm / inputColumnElements[idx];
        return result >= 0 ? result : Number.POSITIVE_INFINITY;
      });

      return results.indexOf(Math.min(...results)) + 1;
    },


    makeFirstTable(inputColumnIndex) {
      if (this.method == "Simplex Padrão") {       
        let table = [];
        table[0] = this.zLine;
        for (let i = 0; i < this.rows; i++) {
          table.push([0, ...this.data.trCoefficients[i], ...this.makeExtraVariables(i)]);
        }

        const { independentTerms } = this.data;
        const tableRows = table.slice(1);
        const outputLineIndex = this._getOutputLineIndex(inputColumnIndex, independentTerms, tableRows);

        this.iterations.push({ table, inputColumnIndex, outputLineIndex });
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
      this.zLine = table[0];
      const inputColumnIndex = this._getInputColumnIndex();

      const tableRows = table.slice(1);
      const independentTerms = tableRows.map(row => row[row.length - 1]);
      const outputLineIndex = this._getOutputLineIndex(inputColumnIndex, independentTerms, tableRows);

      this.iterations.push({ table, inputColumnIndex, outputLineIndex });
      window.console.log(`=> [Next] Col Entra: ${inputColumnIndex} | Lin Sai: ${outputLineIndex}`);
    },
    continueIteration(newTable) {
      const zLine = this._getZLine(newTable[0]);
      const hasNegative = zLine.some(number => number < 0);
      if (hasNegative) {
        this.makeNextTable(newTable);
      } else {
        this.finished = true;
        this.iterations.push({ table: newTable, inputColumnIndex: null, outputLineIndex: null });
        this.showResult(newTable[0]);
      }
    },
  }
};
</script>