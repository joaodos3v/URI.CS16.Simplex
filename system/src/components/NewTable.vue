<template>
  <div class="container-fluid mb-5">
    <h5>Tabela #{{ id }}</h5>
    <table class="table table-borderless">
      <thead>
        <tr>
          <th class="text-center" v-for="label in labels" :key="label">{{ label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rIndex) in table" :key="rIndex">
          <td class="text-center" v-for="(number, nIndex) in row" :key="nIndex"
            :class="[
              {'edge-vertical': nIndex == 0 || nIndex == row.length - 1},
              {'edge-horizontal': rIndex == 0},
              {'edge-bottom': rIndex == table.length - 1},
              {'output': nIndex == inputColumnIndex},
              {'input': rIndex == outputLineIndex},
              {'pivot': nIndex == inputColumnIndex && rIndex == outputLineIndex},
            ]">
            {{ number }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="col text-center mb-5">
      <StepList :table="table" :pivot="pivot" :inputColumnIndex="inputColumnIndex" :outputLineIndex="outputLineIndex" />
      <button v-if="!finished" @click="calculateSolution" class="col-6 btn btn-lg btn-info"><i class="fa fa-arrow-right" aria-hidden="true"></i> CONTINUAR</button>
    </div>
  </div>
</template>


<script>
import StepList from "./StepList";

export default {
  name: "NewTable",

  components: {
    StepList
  },

  props: {
    id: Number,
    table: Array,
    finished: Boolean,
    inputColumnIndex: Number,
    outputLineIndex: Number,
    labels: Array,
  },

  computed: {
    pivot() {
      return (this.outputLineIndex && this.inputColumnIndex) ? Number(this.table[this.outputLineIndex][this.inputColumnIndex]) : null;
    }
  },

  methods: {
    calculateSolution() {
      const newPivotLine = this.table[this.outputLineIndex].map(number => number / this.pivot);

      let newTable = [];
      newTable[this.outputLineIndex] = newPivotLine;
      for (let i = 0; i < this.table.length; i++) {
        if (i != this.outputLineIndex) {
          const tempLine = newPivotLine.map(number => number * (this.table[i][this.inputColumnIndex] * -1));
          const newLine = tempLine.map((number, index) => {
            const currentElm = this.table[i][index];
            if (Number.isInteger(currentElm) || typeof currentElm == "number" || !currentElm.match(/[a-z]/i)) {
              return number + Number(currentElm);
            } else {
              return currentElm;
            }
          });
          newTable[i] = newLine;
        }
      }

      window.console.log("Nova tabela", newTable);
      this.$emit("new-table-ready", newTable);
    }
  }
};
</script>


<style scoped>
  .edge-vertical {
    border-left: 2px solid black!important;
    border-right: 2px solid black!important;
  }

  .edge-horizontal {
    border-top: 2px solid black!important;
    border-bottom: 2px solid black!important;
  }

  .edge-bottom {
    border-bottom: 2px solid black!important;
  }

  .output {
    background-color: #99cddd;
  }

  .input {
    background-color: #99cddd;
  }

  .pivot {
    border: 4px solid #080895;
  }
</style>
