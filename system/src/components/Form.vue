<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col">

        <div class="card border-dark mt-3">
          <div class="card-body">
            <h4 class="card-title text-center">VARIÁVEIS <span class="badge badge-info">{{ variables }}</span></h4>

            <!-- BOTÕES DE CONTROLE -->
            <div class="container">
              <div class="row justify-content-center text-center">
                <div class="col">
                  <button type="button" class="btn btn-secondary btn-block" @click="decrementVariable()" :disabled="variables <= min">
                    <i class="fa fa-minus-circle"></i> REMOVER
                  </button>
                </div>
                <div class="col">
                  <button type="button" class="btn btn-info btn-block" @click="addVariable()" :disabled="variables >= max">
                    <i class="fa fa-plus-circle"></i> ADICIONAR
                  </button>
                </div>
              </div>
            </div>

            <div class="container-fluid">
              <div class="row mt-5">
                
                <!-- FORMULÁRIO -->
                <div class="col-8">
                  <!-- Função Objetivo -->
                  <h5 class="card-title">FUNÇÃO OBJETIVO<hr></h5>
                  <div class="row mb-5">
                    <div class="form-row">
                      <div class="col mr-2">
                        <div class="input-group ml-3">
                          <select class="custom-select" id="igObjective" v-model="objective">
                            <option value="Maximizar" selected>Maximizar</option>
                            <option value="Minimizar">Minimizar</option>
                          </select>
                          <div class="input-group-append">
                            <label class="input-group-text" for="igObjective">Z = </label>
                          </div>
                        </div>
                      </div>
                      <div class="col" v-for="(variable, index) in variables" :key="index">
                        <div class="input-group">
                          <input type="number" class="form-control" v-model="objectiveFunction[index]">
                          <div class="input-group-append">
                            <span class="input-group-text">x{{ variable }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Restrições Técnicas -->
                  <h5 class="card-title">
                    <div class="row">
                      <div class="col-md text-left">RESTRIÇÕES TÉCNICAS</div>
                      <div class="col-md text-right">
                        <button class="btn btn-secondary mr-4" @click="decrementRestriction()" :disabled="restrictions <= min">
                          <i class="fa fa-minus"></i> DELETAR ÚLTIMA
                        </button>
                        <button class="btn btn-info" @click="addRestriction()" :disabled="restrictions >= max">
                          <i class="fa fa-plus"></i> NOVA RESTRIÇÃO
                        </button>
                      </div>
                    </div>
                    <hr>
                  </h5>
                  <div class="row mt-3" v-for="(restriction, rIndex) in restrictions" :key="rIndex">
                    <div class="col" v-for="(variable, vIndex) in variables" :key="variable">
                      <div class="input-group">
                        <input type="number" class="form-control" v-model="technicalRestrictions[rIndex][vIndex]">
                        <div class="input-group-append">
                          <span class="input-group-text">x{{ variable }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="col-2">
                      <select class="custom-select" v-model="signals[rIndex]">
                        <option value="<=" selected>&le;</option>
                        <option value="=">&#x3d;</option>
                        <option value=">=">&ge;</option>
                      </select>
                    </div>
                    <div class="col-2">
                      <input type="number" class="form-control" v-model="independentTerms[rIndex]">
                    </div>
                  </div> 
                </div>

                <!-- MODELO -->
                <div class="col-4 mt-5">
                  <h4 class="ml-5">
                    {{ objective }} Z =
                    <span v-for="(x, key) in objectiveFunction" :key="key">
                      <span v-if="x.length > 0 && x != 0">
                        <span v-if="x > 0"> +{{ x }}x{{ key + 1 }} </span>
                        <span v-else> {{ x }}x{{ key + 1 }} </span>
                      </span>
                    </span>
                  </h4>
                  <h5 class="mt-2 ml-5">
                    Sujeito a: 
                    <div class="col-12" v-for="(restriction, rIndex) in restrictions" :key="rIndex">
                      <span v-for="(variable, vIndex) in variables" :key="variable">
                        <span v-if="technicalRestrictions[rIndex][vIndex] && technicalRestrictions[rIndex][vIndex] != 0">
                          <span v-if="technicalRestrictions[rIndex][vIndex] > 0"> +{{ technicalRestrictions[rIndex][vIndex] }}x{{ variable }}</span>
                          <span v-else> {{ technicalRestrictions[rIndex][vIndex] }}x{{ variable }}</span>
                        </span>
                      </span>

                      <span v-show="independentTerms[rIndex]"> {{ signals[rIndex] }} {{ independentTerms[rIndex] }}</span>
                    </div>
                    <div class="col-12" >
                      <br>
                      <span v-for="(variable, index) in variables" :key="variable">
                        <span v-if="index > 0">,</span> x{{ variable }}
                      </span>
                      &ge; 0
                    </div>
                  </h5>
                  <div class="row mt-3">
                    <button @click="solve" class="btn btn-dark btn-block align-text-bottom">
                      <i class="fa fa-calculator" aria-hidden="true"></i> RESOLVER
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div class="card-footer text-muted text-center">
            <h5>
              Utilize este quadro para construir o modelo que você deseja resolver.
            </h5>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Form",
  data: function() {
    return {
      // Controle
      variables: 2,
      min: 2,
      max: 4,
      restrictions: 2,

      // Dados
      objective: "Maximizar",
      objectiveFunction: [0, 0],
      technicalRestrictions: [
        [2, 1],
        [1, 1],
      ],
      signals: ["<=", "<="],
      independentTerms: [0, 0],
    };
  },
  methods: {
    addVariable() {
      this.variables++;
      this.objectiveFunction.push(0);

      for (let index = 0; index < this.technicalRestrictions.length; index++) {
        this.technicalRestrictions[index].push(0);
      }
    },
    decrementVariable() {
      this.variables--;
      this.objectiveFunction.pop();

      for (let index = 0; index < this.technicalRestrictions.length; index++) {
        this.technicalRestrictions[index].pop();
      }
    },
    addRestriction() {
      this.restrictions++;
      this.signals.push("<=");

      let newTR = [...Array(this.variables).fill(0)];
      this.technicalRestrictions.push(newTR);
    },
    decrementRestriction() {
      this.restrictions--;
      this.signals.pop();
      this.technicalRestrictions.pop();
    },
    solve() {
      let dataToCalculate = {
        min: this.min,
        numberVariables: this.variables,
        objective: this.objective,
        ofCoefficients: [...this.objectiveFunction],
        trCoefficients: this.technicalRestrictions.map(tr => [...tr]),
        signals: [...this.signals],
        independentTerms: [...this.independentTerms]
      };
      
      this.$emit("generate-solution", dataToCalculate);
    }
  }
};
</script>
