<template>
  <div id="app">
    <Header title="SimplexSolver" subtitle="Solucionador de problemas de programação matemática utilizando o método simplex"></Header>
    <div id="main">



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
                          <div class="col" v-for="(variable, index) in variables" :key="variable">
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
                            <button class="btn btn-secondary mr-4" @click="decrementRestriction()" :disabled="restrictions.length <= min">
                              <i class="fa fa-minus"></i> DELETAR ÚLTIMA
                            </button>
                            <button class="btn btn-info" @click="addRestriction()" :disabled="restrictions.length >= max">
                              <i class="fa fa-plus"></i> NOVA RESTRIÇÃO
                            </button>
                          </div>
                        </div>
                        <hr>
                      </h5>
                      <div class="row mt-3" v-for="(restriction, index) in restrictions" :key="index">
                        <div class="col" v-for="variable in variables" :key="variable">
                          <div class="input-group">
                            <input type="number" class="form-control" v-model="restrictionsFunction[`${variable}${index}`]">
                            <div class="input-group-append">
                              <span class="input-group-text">x{{ variable }}</span>
                            </div>
                          </div>
                        </div>
                        <div class="col-2">
                          <select class="custom-select" v-model="signals[index]">
                            <option value="<=" selected>&le;</option>
                            <option value="=">&#x3d;</option>
                            <option value=">=">&ge;</option>
                          </select>
                        </div>
                        <div class="col-2">
                          <input type="number" class="form-control" v-model="independentTerms[index]">
                        </div>
                      </div> 
                    </div>

                    <!-- MODELO -->
                    <div class="col-4 mt-5">
                      <h4 class="ml-5">
                        {{ objective }} Z =
                        <span v-for="(x, key) in objectiveFunction" :key="x">
                          <span v-if="x.length > 0 && x != 0">
                            <span v-if="x > 0"> +{{ x }}x{{ key + 1 }} </span>
                            <span v-else> {{ x }}x{{ key + 1 }} </span>
                          </span>
                        </span>
                      </h4>
                      <h5 class="mt-2 ml-5">
                        Sujeito a: 
                        <div class="col-12" v-for="(restriction, index) in restrictions" :key="index">
                          <span v-for="variable in variables" :key="variable">
                            <span v-if="restrictionsFunction[`${variable}${index}`] && restrictionsFunction[`${variable}${index}`] != 0">
                              <span v-if="restrictionsFunction[`${variable}${index}`] > 0"> +{{ restrictionsFunction[`${variable}${index}`] }}x{{ variable }}</span>
                              <span v-else> {{ restrictionsFunction[`${variable}${index}`] }}x{{ variable }}</span>
                            </span>
                          </span>

                          <span v-show="independentTerms[index]"> {{ signals[index] }} {{ independentTerms[index] }}</span>
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
                        <button class="btn btn-dark btn-block align-text-bottom">
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


      

    </div>
  </div>
</template>

<script>
import "bootstrap/dist/css/bootstrap.css";
import "font-awesome/css/font-awesome.css";

import Header from "./components/Header";

export default {
  name: "app",
  components: {
    Header
  },
  data: function() {
    return {
      // Controle
      variables: 2,
      min: 2,
      max: 4,
      restrictions: [
        [],
        [],
      ],

      // Dados
      objective: "Maximizar",
      objectiveFunction: [],
      restrictionsFunction: [],
      signals: ["<=", "<="],
      independentTerms: [],
    };
  },
  methods: {
    addVariable() {
      this.variables++;
    },
    decrementVariable() {
      this.variables--;
    },
    addRestriction() {
      this.restrictions.push([]);
      this.signals.push("<=");
    },
    decrementRestriction() {
      this.restrictions.pop();
    },
    generateModel() {
      alert("sjkdhfsdf");
    },
  }
};
</script>

<style>
.destacar {
  border: 1px solid black;
  background-color: blueviolet;
}
</style>
