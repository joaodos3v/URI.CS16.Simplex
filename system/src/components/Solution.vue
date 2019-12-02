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
    this.currentMethod = this.method;

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
      mLargePositions: [],
      mLargeCurrentPosition: 0,
      currentMethod: "",
    };
  },

  computed: {
    columns() {
      // Nº Colunas => sempre será o número de restrições (variáveis de folga) + o número de variáveis + 2 (coluna de Z e coluna de termos independentes)
      if (this.currentMethod == "Simplex Padrão") {

        return this.data.trCoefficients.length + this.data.numberVariables + 2;
      } else { // Nº Colunas => é o número de variáveis de folga (mas aqui pode ter "=", que não precisa de variável de folga) + o número de variáveis + 2 (coluna de Z e coluna de termos independentes)

        const occurrencesDiffEqual = this.data.signals.filter(signal => signal != "=");
        return occurrencesDiffEqual.length + this.data.numberVariables + 2;
      }
    },
    rows() {
      // O número de linhas sempre será o número de restrições técnicas + 1 (função objetivo, que é calcula em 'zLine')
      return this.data.trCoefficients.length;
    },
  },

  methods: {
    showResult(zLine) {
      if (typeof zLine == "string") {
        this.solution = zLine;
      } else {
        this.solution = zLine[zLine.length - 1];
      }
    },
    finishCalculation(lastTable, result) {
      this.finished = true;
      this.iterations.push({ table: lastTable, inputColumnIndex: null, outputLineIndex: null });
      this.showResult(result);
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

      // Adiciona variáveis "a"
      if (this.currentMethod == "M Grande") {
        let newElements = [];
        this.data.signals.forEach((element, idx) => {
          if (element === ">=" || element === "=") {
            this.mLargePositions.push(idx);
            const position = idx + 1;
            newElements.push(`M${position}`);
          }
        });

        const tempElement = initialZLine.pop();
        initialZLine.push(...newElements, tempElement);
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

      if (this.currentMethod == "M Grande") {
        let zLineCoefficientsWithoutM = zLineCoefficients.filter(elm => typeof elm === "number" && isFinite(elm));
        return this.zLine.indexOf(Math.min(...zLineCoefficientsWithoutM));
      }

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
      let table = [];
      table[0] = this.zLine;

      if (this.currentMethod == "Simplex Padrão") {
        for (let i = 0; i < this.rows; i++) {
          table.push([0, ...this.data.trCoefficients[i], ...this.makeExtraVariables(i)]);
        }
      } else {
        for (let i = 0; i < this.rows; i++) {
          table.push([0, ...this.data.trCoefficients[i], ...this.makeMLargeExtraVariables(i)]);
        }
      }
      
      const { independentTerms } = this.data;
      const tableRows = table.slice(1);
      const outputLineIndex = this._getOutputLineIndex(inputColumnIndex, independentTerms, tableRows);

      this.iterations.push({ table, inputColumnIndex, outputLineIndex });
    },
    makeExtraVariables(index) {
      let elements = [...Array(this.data.trCoefficients.length).fill(0), this.data.independentTerms[index]];
      elements[index] = 1;
      return elements;
    },
    makeMLargeExtraVariables(index) {
      let numOccurrencesDiffEqual = 0;
      let linesHasOccurrencesDiffEqual = [];
      let newVariables = [];
      const { signals } = this.data;

      signals.forEach((element, idx) => {
        if (element == "<=" || element == ">=") {
          numOccurrencesDiffEqual++;
          linesHasOccurrencesDiffEqual.push(idx);
        }
      });
      
      let clearanceVariables = [...Array(numOccurrencesDiffEqual).fill(0)];
      if (linesHasOccurrencesDiffEqual.includes(index)) {
        clearanceVariables[index] = (signals[index] == ">=") ? -1 : 1;
      }

      let mLargeVariables = [...Array(this.mLargePositions.length).fill(0), this.data.independentTerms[index]];
      if (this.mLargePositions.includes(index)) {
        mLargeVariables[this.mLargeCurrentPosition] = 1;
        this.mLargeCurrentPosition++;
      }

      newVariables.push(...clearanceVariables, ...mLargeVariables);
      return newVariables;
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

      if (this.currentMethod == "Simplex Padrão") {
        if (hasNegative) {
          this.makeNextTable(newTable);
        } else {
          this.finishCalculation(newTable, newTable[0]);
        }
      } else {
        const hasBasicVariables = this.checkMLargeColumns(newTable);

        if (!hasBasicVariables) {
          if (hasNegative) {
            // NÃO EXISTEM MAIS variáveis básicas e ainda existe nº negativo na linha de Z...
            const refactoredTable = this.refactorTableAfterMLarge(newTable);
            this.currentMethod = "Simplex Padrão";
            this.makeNextTable(refactoredTable);
          } else {
            // NÃO EXISTEM MAIS variáveis básicas E NÃO existe nº negativo na linha de Z...
            this.finishCalculation(newTable, newTable[0]);
          }
        } else {
          if (hasNegative) {
            // Ainda existem variáveis básicas e ainda existe nº negativo na linha de Z...
            this.makeNextTable(newTable);
          } else {
            // Ainda existem variáveis básicas, porém NÃO existe nº negativo na linha de Z...
            this.finishCalculation(newTable, "SEM SOLUÇÃO");
          }
        }
      }
    },
    checkMLargeColumns(table) {
      const mLargeColumns = this._getMLargeColumns(table);
      const hasBasicVariables = this._hasBasicVariables(table, mLargeColumns);
      return hasBasicVariables;
    },
    _getMLargeColumns(table) {
      const mLargeColumns = [];
      table[0].map((coefficient, idx) => {
        if (typeof coefficient == "string") {
          mLargeColumns.push(idx);
        }
      });

      return mLargeColumns;
    },
    _hasBasicVariables(table, mLargeColumns) {
      let basicVariables = 0;
      for (let i = 0; i < mLargeColumns.length; i++) {
        let column = [];
        for (let j = 1; j < table.length; j++) {
          const row = table[j];
          column.push(row[mLargeColumns[i]]);
        }
        
        const hasDiff = column.some(coefficient => coefficient < 0 || coefficient > 1);
        if (!hasDiff) {
          const amountOfOne = column.filter(coefficient => coefficient == 1);
          if (amountOfOne.length == 1) basicVariables++;
        }
      }

      return basicVariables > 0 ? true : false;
    },
    refactorTableAfterMLarge(table) {
      const mLargeColumns = this._getMLargeColumns(table);

      let refactoredTable = [];
      for (let i = 0; i < table.length; i++) {
        let row = [...table[i]];
        row.splice(mLargeColumns[0], mLargeColumns.length);
        refactoredTable.push([...row]);
      }
      
      return refactoredTable;    
    },
  }
};
</script>