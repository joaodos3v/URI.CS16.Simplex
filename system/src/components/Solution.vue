<template>
  <div>
    <div v-for="num in numTables" :key="num">
      <NewTable :id="num" :table="table" :outputColumn="outputColumn" />
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
      numTables: 1,
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
    zLine() {
      let transformedValues = this.data.ofCoefficients.map(coefficient => coefficient * -1);
      let line = [1, ...transformedValues];

      for (let i = 0; i < this.columns; i++) {
        if (!line[i]) {
          line[i] = 0;
        }
      }

      return line;
    },
    outputColumn() {
      const zLine = [...this.zLine];
      zLine.shift(); // Coluna Z
      zLine.pop(); // Termo Independente

      return this.zLine.indexOf(Math.min(...zLine));
    },
    table() {
      if (this.method == "Simplex Padrão") {       
        let table = [];
        table[0] = this.zLine;

        for (let i = 0; i < this.rows; i++) {
          table.push([0, ...this.data.trCoefficients[i], ...this.makeExtraVariables(i)]);
        }
        return table;
      } else {
        return null;
      }
    }
  },
  methods: {
    makeExtraVariables(index) {
      let elements = [...Array(this.data.numberVariables).fill(0), this.data.independentTerms[index]];
      elements[index] = 1;
      return elements;
    }
  }
};
</script>