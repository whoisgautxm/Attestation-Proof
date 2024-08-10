// Copyright 2024 RISC Zero, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use json_core::Outputs;
use json_methods::SEARCH_JSON_ELF;
use risc0_zkvm::{default_prover, ExecutorEnv};

fn main() {
    let data = include_str!("../../../../formattedResult.json");
    let outputs = search_json(data);
    println!();
    println!("  {:?}", outputs.hash);
    println!(
        "provably contains a fields: {:?}",
        outputs.data
    );

}

fn search_json(data: &str) -> Outputs {
    let env = ExecutorEnv::builder()
        .write(&data)
        .unwrap()
        .build()
        .unwrap();

    // Obtain the default prover.
    let prover = default_prover();

    // Produce a receipt by proving the specified ELF binary.
    let receipt = prover.prove(env, SEARCH_JSON_ELF).unwrap().receipt;

    receipt.journal.decode().unwrap()
}

#[cfg(test)]
mod tests {
    use super::search_json;
    use risc0_zkvm::sha::{Impl, Sha256, Digest};

    #[test]
    fn main() {
        let data = include_str!("../../../../../formattedResult.json");
        let outputs = search_json(data);
        // let expected_fields = vec!["boolean_field", "critical_data", "obj_field"];

        // // Verify that the output contains the expected fields
        // assert_eq!(outputs.data, expected_fields, "Field names do not match");

        // Calculate the Merkle root
        let field_hashes: Vec<Digest> = expected_fields
            .iter()
            .map(|s| *Impl::hash_bytes(s.as_bytes()))
            .collect();

        fn compute_merkle_root(hashes: &[Digest]) -> Digest {
            if hashes.is_empty() {
                return Digest::default();
            }
            if hashes.len() == 1 {
                return hashes[0];
            }
            let mut next_level = Vec::new();
            for chunk in hashes.chunks(2) {
                if chunk.len() == 2 {
                    let combined = [chunk[0].as_bytes(), chunk[1].as_bytes()].concat();
                    next_level.push(*Impl::hash_bytes(&combined));
                } else {
                    next_level.push(chunk[0]);
                }
            }
            compute_merkle_root(&next_level)
        }

        let calculated_root = compute_merkle_root(&field_hashes);

        // Assert that the calculated hash matches the output hash
        assert_eq!(outputs.hash, calculated_root, "Merkle root hashes do not match");
    }
}
